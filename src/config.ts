import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";
import yaml from "./config/site.yml";

// 站点设置全部在 src/config/site.yml 里维护，可在后台 /admin 的「站点设置」中修改。
// 修改后由 webhook 自动构建上线，无需改动代码。

type NavBarItemYaml = {
	preset?: string;
	name?: string;
	url?: string;
	external?: boolean;
};

interface SiteYaml {
	site: Omit<SiteConfig, "favicon">;
	profile: ProfileConfig;
	navbar: NavBarItemYaml[];
	license: LicenseConfig;
}

const cfg = yaml as SiteYaml;

export const siteConfig: SiteConfig = {
	...cfg.site,
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: cfg.navbar.map((item) =>
		item.preset
			? LinkPreset[item.preset as keyof typeof LinkPreset]
			: {
					name: item.name ?? "",
					url: item.url ?? "",
					external: item.external ?? false,
				},
	),
};

export const profileConfig: ProfileConfig = cfg.profile;

export const licenseConfig: LicenseConfig = cfg.license;

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
