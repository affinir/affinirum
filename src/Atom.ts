export interface IAtom {
	match(atom: IAtom): boolean;
	weight(): number;
	toString(): string;
}
