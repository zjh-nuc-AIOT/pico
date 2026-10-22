// GitHub webhook → 自动部署监听器
// 收到 main 分支的 push 事件后执行: git pull + pnpm install + pnpm deploy
import { createHmac, timingSafeEqual } from "node:crypto";
import { appendFileSync } from "node:fs";
import { createServer } from "node:http";
import { execFile } from "node:child_process";

const PORT = 3210;
const SECRET = process.env.DEPLOY_HOOK_SECRET;
const REPO_DIR = "/root/zjh_blog";
const LOG_FILE = "/var/log/blog-deploy.log";

if (!SECRET) {
	console.error("DEPLOY_HOOK_SECRET is not set");
	process.exit(1);
}

function log(msg) {
	const line = `[${new Date().toISOString()}] ${msg}\n`;
	appendFileSync(LOG_FILE, line);
	console.log(line.trim());
}

function verifySignature(rawBody, signature) {
	if (!signature?.startsWith("sha256=")) return false;
	const expected = `sha256=${createHmac("sha256", SECRET).update(rawBody).digest("hex")}`;
	const a = Buffer.from(signature);
	const b = Buffer.from(expected);
	return a.length === b.length && timingSafeEqual(a, b);
}

let deploying = false;
function deploy() {
	if (deploying) return log("deploy already running, skip");
	deploying = true;
	log("deploy start");
	const steps = [
		["git", ["pull", "--ff-only"]],
		["pnpm", ["install", "--frozen-lockfile"]],
		["pnpm", ["deploy-site"]],
	];
	const run = (i) => {
		if (i >= steps.length) {
			deploying = false;
			return log("deploy done");
		}
		const [cmd, args] = steps[i];
		execFile(cmd, args, { cwd: REPO_DIR, timeout: 600_000 }, (err, stdout, stderr) => {
			if (stdout) log(`$ ${cmd} ${args.join(" ")}\n${stdout.trim()}`);
			if (err) {
				log(`deploy failed at '${cmd}': ${err.message}\n${stderr?.trim() ?? ""}`);
				deploying = false;
				return;
			}
			run(i + 1);
		});
	};
	run(0);
}

createServer((req, res) => {
	if (req.method !== "POST" || req.url !== "/hooks/deploy") {
		res.writeHead(404).end("not found");
		return;
	}
	const chunks = [];
	req.on("data", (c) => chunks.push(c));
	req.on("end", () => {
		const rawBody = Buffer.concat(chunks);
		if (!verifySignature(rawBody, req.headers["x-hub-signature-256"])) {
			log(`rejected: bad signature from ${req.socket.remoteAddress}`);
			res.writeHead(401).end("bad signature");
			return;
		}
		let payload;
		try {
			payload = JSON.parse(rawBody.toString("utf8"));
		} catch {
			res.writeHead(400).end("bad json");
			return;
		}
		if (req.headers["x-github-event"] !== "push" || payload.ref !== "refs/heads/blog") {
			res.writeHead(200).end("ignored");
			return;
		}
		res.writeHead(202).end("deploying");
		deploy();
	});
}).listen(PORT, "127.0.0.1", () => log(`listening on 127.0.0.1:${PORT}`));
