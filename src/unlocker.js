import { decrypt } from './crypto.mjs';

export function Unlocker(wishlist) {

	const INPUT = document.createElement('input');
	INPUT.type = 'password';
	INPUT.placeholder = "Passphrase";

	return new Promise(resolve => {
		(overlay => {
			overlay.classList.add('overlay');
			(form => {
				form.addEventListener('submit', event => {
					event.preventDefault();
					INPUT.disabled = true;
					const DECRYPTED = decrypt(wishlist, INPUT.value);
					if (DECRYPTED) {
						overlay.remove();
						resolve(DECRYPTED);
					} else {
						INPUT.value = "";
						INPUT.disabled = false;
						INPUT.focus();
					}
				});
				form.classList.add('unlock-form');
				(label => {
					label.classList.add('unlock-form-heading');
					label.appendChild(INPUT);
				})(form.appendChild(document.createElement('label')));
				(submitButton => {
					submitButton.type = 'submit';
					submitButton.value = "Unlock";
				})(form.appendChild(document.createElement('input')));
			})(overlay.appendChild(document.createElement('form')));
		})(document.body.appendChild(document.createElement('div')));
		INPUT.focus();
	});
};

export default Unlocker;
