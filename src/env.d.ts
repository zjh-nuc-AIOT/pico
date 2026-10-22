/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare module "*.yml" {
	const value: unknown;
	export default value;
}
