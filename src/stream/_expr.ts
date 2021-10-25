import * as graphy from '@graphy/types';

import {
	DataFactory,
} from '@graphy/core';

type QuadFilterExpression = string;
type TermFilterExpressoin = string;

interface TermFilterExpressionTree {

}

interface QuadFilterExpressionTree {
	subject?: TermFilterExpressoin | TermFilterExpressionTree;
}

interface IConfigQuadFilter {
	expression: QuadFilterExpression | QuadFilterExpressionTree;
}

 export class QuadFilter {
	constructor(gc_filter: IConfigQuadFilter) {

	}


 }