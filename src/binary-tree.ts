export interface IBinaryTreeNode<T> {
    data: T;
    left: IBinaryTreeNode<T>;
    right: IBinaryTreeNode<T>;
    toString(): string;
}

export class BinaryTreeNode<T> implements IBinaryTreeNode<T> {
    data: T;
    left: IBinaryTreeNode<T>;
    right: IBinaryTreeNode<T>;

    constructor(data: T) {
        this.data  = data;
        this.left  = null;
        this.right = null;
    }

    public toString(): string {
        return `data: ${this.data}`;
    }
}

