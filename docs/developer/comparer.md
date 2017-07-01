# IComparer

[IComparer][comparer link] is a custom type providing a simple interface to define how to compare two arbitrary objects 
(both of the same type).

The comparison function must take two arguments of the same type and output a number.

```typescript

// Custom type with a string member and a number member.  How do you decide which among two objects is 
// greater?
interface IMyObject {
    member1: string;
    member2: number;
}

const myObject0 = { member1: 'hello there', member2: 35 };
const myComparer: IComparer<IMyObject> = (a: IMyObject, b: IMyObject): number => {
    return a.member2 - b.member2;
};

const bstObject: IBinarySearchTree<IMyObject> = new BinarySearchTree<IMyObject>(myObject0, myComparer);
```

In the above example, the comparer is written such that two objects are compared against `#member2`.  An IComparer must 
return a number with the following stipulations:

- If two objects are equivalent, return exactly 0.
- If the first object is greater than the second object, return any number greater than 0.
- If the first object is less than the second object, return any number less than 0.


A comparer can be written in any way, as long as it suits the needs of the custom object.

```typescript

enum MyEnum { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY }

// Custom type with a string member, a number member, and an enum member.  How do you decide which among 
// two objects is greater?
interface IMyObject {
    member1: string;
    member2: number;
    member3: MyEnum;
}

const myComparer: IComparer<IMyObject> = (a: IMyObject, b: IMyObject): number => {
    if (a.member3 == MyEnum.MONDAY) return 1;
    else if (b.member3 == MyEnum.TUESDAY) return -1;
    else return a.member2 - b.member2;
};
```

The above example is contrived and probably wouldn't make much real-world sense.  However, it illustrates the point that 
an [IComparer][comparer link] can use whatever means to determine which object is greater, as long as it returns a
number.

*__WARNING__: If improperly implemented (i.e., returning -1 when the objects are actually equal), an [IComparer][comparer link] will
 likely produce unsatisfactory results.*
 
[comparer link]: https://github.com/haleyhousellc/arboriculture/blob/master/src/binary-tree/binary-tree.ts#L58