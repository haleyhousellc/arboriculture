const uuidV1 = require('uuid/v1');
const uuidV4 = require('uuid/v4');

/**
 * Defines a type with string keys and string values
 */
export type StringKeyStringValue = { [s: string]: string }

/**
 * Defines a generic type with string keys and values of type T
 */
export type StringKeyObjectValue<T> = { [s: string]: T}

/**
 * Typescript hack - this facilitates a "typed strings" type.  Essentially an enum with string keys.
 */
export type UnionKeyToValue<U extends string> = { [K in U]: K; }

/**
 * The current package version
 */
export const VERSION: string    = '0.1.0';

/**
 * The user agent string
 */
export const USER_AGENT: string = `arboriculture/${VERSION}`;

/**
 * Convenience type representing a uuid version.  Default is v1 (time-based), v4 (random) is also available
 * @link https://github.com/kelektiv/node-uuid
 */
export type UuidVersion = 'v1' | 'v4';
export const UuidVersionEnum: UnionKeyToValue<UuidVersion> = {
    v1: "v1",
    v4: "v4"
};

/**
 * Generates a random uuid string via the uuid npm package
 */
export function generateUuid(version: UuidVersion = UuidVersionEnum.v1): string {
    if (version == UuidVersionEnum.v4) return uuidV4();
    return uuidV1();
}