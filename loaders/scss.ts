// João Farias © 2024 BeyondMagic <beyondmagic@mail.ru>

import { plugin } from "bun";
import * as sass from 'sass';

plugin({
	name: "sass",
	setup (build) {
		build.onLoad(
			{ filter: /\.(sass|scss)$/ },
			({ path }) => {
				const contents =
					'const text = `' + sass.compile(path).css + '`;' +
					'export default text;'

				global.web_socket?.send(global.web_socket_command);

				return {
					contents,
					loader: 'ts',
				}
			}
		)
	},
});
