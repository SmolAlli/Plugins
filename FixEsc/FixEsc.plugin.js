/**
 * @name FixEsc
 * @author SmolAlli
 * @description Fixes ESC no longer jumping the user down to the bottom of chat. That's... it.
 * @version 0.0.1
 */

module.exports = class ExamplePlugin {
	handleKeydown(e) {
		if (e.keyCode === 27) {
			let messages = document.querySelector('.scroller-kQBbkU');
			messages.scrollTop = messages.scrollHeight;
		}
	}

	start() {
		document.addEventListener('keydown', this.handleKeydown);
	} // Required function. Called when the plugin is activated (including after reloads)
	stop() {
		document.removeEventListener('keydown', this.handleKeydown);
	} // Required function. Called when the plugin is deactivated
};
