export interface IAtom {
	equate(atom: IAtom): boolean;
	accept(atom: IAtom): boolean;
	intersect(atom: IAtom): boolean;
	weight(): number;
	toString(): string;
}
