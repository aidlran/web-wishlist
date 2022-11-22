import { cp, readdir } from 'fs/promises';
import { join } from 'path';

export async function cloneDirStructure(dirRoot, target) {
	return readdir(dirRoot).then(directory => {
		for (const name of directory)
			cp(
				join(dirRoot, name),
				join(target, name),
				{recursive: true}
			);
	});
};

export default cloneDirStructure;
