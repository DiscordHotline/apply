import Head from 'next/head';
import App, {Container} from 'next/app';
import React from 'react';

import {AuthProvider} from '../hooks/useAuthContext';
import getUser from '../util/getUser';

export default class extends App<{user: any}> {
    static async getInitialProps({Component, ctx}) {
        let pageProps = {};

        let user;
        try {
            user = await getUser(ctx);
            ctx.user = user;
        } catch (e) {
            console.error('Failed fetching user: ', e);
        }

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx);
        }

        return {pageProps, user};
    }

    public render() {
        const {Component, pageProps, user} = this.props;

        return (
            <Container>
                <Head>
                    <title>Discord Hotline</title>
                </Head>
                <main>
                    <section className="hero is-fullheight">
                        <div className="hero-body">
                            <div className="container">
                                <div className="columns centered">
                                    <div className="column is-6">
                                        <img alt="logo"
                                            src="https://s3.amazonaws.com/discord-hotline-asset-bucket/logo.png"/>
                                    </div>
                                    <div className="column is-6">
                                        <AuthProvider user={user}>
                                            <Component {...pageProps} />
                                        </AuthProvider>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </Container>
        );
    }
}
