import Document, {Head, Main, NextScript} from 'next/document';
import React from 'react';

export default class extends Document {
    public render() {
        return (
            <html lang="en">
                <Head>
                    <meta name="keywords" content="Discord, Discord Moderators, Discord Moderation, Discord Hotline"/>
                    <meta name="description" content="Apply to join Discord Hotline and our community of moderators!"/>

                    <meta property="og:title" content="Discord Hotline"/>
                    <meta property="og:type" content="website"/>
                    <meta property="og:locale" content="en_US"/>
                    <meta property="og:url" content="https://apply.hotline.gg"/>
                    <meta property="og:site_name" content="Discord Hotline"/>
                    <meta property="og:description"
                        content="Apply to join Discord Hotline and our community of moderators!"/>
                    <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"/>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css"
                        integrity="sha256-2pUeJf+y0ltRPSbKOeJh09ipQFYxUdct5nTY6GAXswA=" crossOrigin="anonymous"/>
                    <style dangerouslySetInnerHTML={{
                        __html: `
body {
    background: rgba(73, 155, 234, 1);
    background: -moz-linear-gradient(-45deg, rgba(73, 155, 234, 1) 0%, rgba(150, 191, 231, 1) 45%, rgba(227, 227, 227, 1) 90%, rgba(227, 227, 227, 1) 100%);
    background: -webkit-gradient(left top, right bottom, color-stop(0%, rgba(73, 155, 234, 1)), color-stop(45%, rgba(150, 191, 231, 1)), color-stop(90%, rgba(227, 227, 227, 1)), color-stop(100%, rgba(227, 227, 227, 1)));
    background: -webkit-linear-gradient(-45deg, rgba(73, 155, 234, 1) 0%, rgba(150, 191, 231, 1) 45%, rgba(227, 227, 227, 1) 90%, rgba(227, 227, 227, 1) 100%);
    background: -o-linear-gradient(-45deg, rgba(73, 155, 234, 1) 0%, rgba(150, 191, 231, 1) 45%, rgba(227, 227, 227, 1) 90%, rgba(227, 227, 227, 1) 100%);
    background: -ms-linear-gradient(-45deg, rgba(73, 155, 234, 1) 0%, rgba(150, 191, 231, 1) 45%, rgba(227, 227, 227, 1) 90%, rgba(227, 227, 227, 1) 100%);
    background: linear-gradient(135deg, rgba(73, 155, 234, 1) 0%, rgba(150, 191, 231, 1) 45%, rgba(227, 227, 227, 1) 90%, rgba(227, 227, 227, 1) 100%);
    filter:     progid:DXImageTransform.Microsoft.gradient(startColorstr='#499bea', endColorstr='#e3e3e3', GradientType=1);
}

.centered > .column{
    display:         flex;
    flex-direction:  column;
    justify-content: center;
}

.card {
    border-radius: 1rem;
    background: rgba(255, 255, 255, .8);
}

.card hr {
    background-color: rgba(0, 0, 0, .4);
}
`,
                    }}/>
                </Head>
                <body>
                    <noscript>This site requires JavaScript</noscript>
                    <main role="main"><Main/></main>
                    <NextScript/>
                </body>
            </html>
        );
    }
}
