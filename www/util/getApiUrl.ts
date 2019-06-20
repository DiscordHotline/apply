export default function getApiUrl() {
    return process.env.NOW_REGION === 'dev1'
        ? 'http://localhost:3000'
        : 'https://apply.hotline.gg';
}
