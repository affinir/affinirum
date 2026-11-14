export interface IAtom {
	equals(atom: IAtom): boolean;
	accepts(atom: IAtom): boolean;
	intersects(atom: IAtom): boolean;
	weight(): number;
	toString(): string;
}
