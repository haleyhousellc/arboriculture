
import * as uuid from 'uuid';


/**
 * Defines a type with string keys and string values
 */
export type StringKeyStringValue = { [s: string]: string };

/**
 * Defines a generic type with string keys and values of type T
 */
export type StringKeyObjectValue<K, V> = { [s: string]: V};

/**
 * Typescript hack - this facilitates a "typed strings" type.  Essentially an enum with string keys.
 */
export type UnionKeyToValue<U extends string> = { [K in U]: K; };


/**
 * Convenience type representing a uuid version.  Default is v1 (time-based), v4 (random) is also available
 * @link https://github.com/kelektiv/node-uuid
 */
export type UuidVersion = 'v1' | 'v4';
export const UUID_VERSION_ENUM: UnionKeyToValue<UuidVersion> = {
    v1: 'v1',
    v4: 'v4',
};

/**
 * Generates a random uuid string via the uuid npm package
 */
export function generateUuid(version: UuidVersion = UUID_VERSION_ENUM.v1): string {
    if (version === UUID_VERSION_ENUM.v4) return uuid.v4();

    return uuid.v1();
}
