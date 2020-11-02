
import graphy from '@graphy/core';

import FactorySuite from '../../helper/factory-suite.mjs';

(new FactorySuite({
	export: '@graphy/core',
	factory: graphy,
})).run();
