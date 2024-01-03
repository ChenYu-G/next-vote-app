/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		API_ADDRESS: 'https://next-vote-app.vercel.app/api',
	},

	swcMinify: false,
}

module.exports = nextConfig
