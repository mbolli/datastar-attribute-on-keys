export type ErrorFn = (name: string, ctx?: Record<string, any>) => void;
export type RequirementType = "allowed" | "must" | "denied" | "exclusive";
export type Requirement = RequirementType | {
	key: Exclude<RequirementType, "exclusive">;
	value?: Exclude<RequirementType, "exclusive">;
} | {
	key?: Exclude<RequirementType, "exclusive">;
	value: Exclude<RequirementType, "exclusive">;
};
export type Rx<B extends boolean> = (...args: any[]) => B extends true ? unknown : void;
export type ReqField<R, K extends "key" | "value", Return> = R extends "must" | {
	[P in K]: "must";
} ? Return : R extends "denied" | {
	[P in K]: "denied";
} ? undefined : R extends "allowed" | {
	[P in K]: "allowed";
} | (K extends keyof R ? never : R) ? Return | undefined : never;
export type ReqFields<R extends Requirement, B extends boolean> = R extends "exclusive" ? {
	key: string;
	value: undefined;
	rx: undefined;
} | {
	key: undefined;
	value: string;
	rx: Rx<B>;
} : {
	key: ReqField<R, "key", string>;
	value: ReqField<R, "value", string>;
	rx: ReqField<R, "value", Rx<B>>;
};
export type AttributeContext<R extends Requirement = Requirement, RxReturn extends boolean = boolean> = {
	el: HTMLOrSVG;
	mods: Modifiers;
	rawKey: string;
	evt?: Event;
	error: ErrorFn;
} & ReqFields<R, RxReturn>;
export type AttributePlugin<R extends Requirement = Requirement, RxReturn extends boolean = boolean> = {
	name: string;
	apply: (ctx: AttributeContext<R, RxReturn>) => void | (() => void);
	requirement?: R;
	returnsValue?: RxReturn;
	argNames?: string[];
};
export type HTMLOrSVG = HTMLElement | SVGElement | MathMLElement;
export type Modifiers = Map<string, Set<string>>; // mod name -> tags
export type EventCallbackHandler = (...args: any[]) => void;
declare function onKeysPlugin(beginBatch: () => void, endBatch: () => void): AttributePlugin;
export declare const modifyViewTransition: (callback: EventCallbackHandler, mods: Modifiers) => EventCallbackHandler;
export declare const modifyTiming: (callback: EventCallbackHandler, mods: Modifiers) => EventCallbackHandler;

export {
	onKeysPlugin as default,
};

export {};
