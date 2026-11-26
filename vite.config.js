import basicSsl from "@vitejs/plugin-basic-ssl";
import fs from "fs";

/*
const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
};
*/
export default {
	plugins: [
		basicSsl({
			/** name of certification */
			name: "Sara ",
			/** custom trust domains */
			domains: ["localhost"],
			/** optional, days before certificate expires */
			ttlDays: 30,
			/** custom certification directory */
			certDir: "/Users/.../.devServer/cert",
		}),
	],
};
