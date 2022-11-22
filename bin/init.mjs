#!/usr/bin/env node

import cloneDirStructure from './service/cloneDir.mjs';
import { DIR_DEFAULT } from './service/config.mjs';

await cloneDirStructure(DIR_DEFAULT, './');
