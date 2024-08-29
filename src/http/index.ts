import { Logger } from "@car-qr-link/messaging-base";
import { createServer, Server, ServerResponse } from "http";

export interface Request {
    method: string;
    url: URL;
    headers: Record<string, string>;
    body: any;
}

export class HttpServerOptions {
    public readonly bodyLimit: number;

    public constructor(options: Partial<HttpServerOptions> = {}) {
        this.bodyLimit = options.bodyLimit || 1024 * 1024;
    }
}

export class HttpServer {
    private server: Server | null = null;

    public constructor(
        private readonly handler: (req: Request, res: ServerResponse) => Promise<void>,
        private readonly logger: Logger,
        private readonly options: HttpServerOptions = new HttpServerOptions()
    ) {

    }

    public async listen(port: number) {
        if (this.server) {
            throw new Error('Server already started');
        }

        this.server = createServer(async (req, res) => {
            try {
                const body = await new Promise<string>((resolve, reject) => {
                    let data = '';
                    req.on('data', (chunk: any) => {
                        data += chunk;

                        if (data.length > this.options.bodyLimit) {
                            reject(new Error('Request body too large'));
                        }
                    });
                    req.on('end', () => {
                        resolve(data);
                    });
                    req.on('error', (err: any) => {
                        reject(err);
                    });
                });

                const headers: Record<string, string> = {};

                for (const [key, value] of Object.entries(req.headers)) {
                    if (typeof value !== 'string') {
                        continue;
                    }
                    headers[key] = value;
                }

                const request: Request = {
                    method: req.method || '',
                    url: new URL(req.url || '', `http://${req.headers.host || 'localhost'}`),
                    headers: headers,
                    body: body,
                };

                if (req.headers["content-type"]?.includes('application/json')) {
                    request.body = JSON.parse(body);
                }

                await this.handler(request, res);
            } catch (e) {
                this.logger.error('Error handling request', { error: e });
                res.writeHead(500);
                res.write('Internal server error');
                res.end();
            }
        });

        this.server.listen(port, () => {
            this.logger.info('Listening on port ' + port);
        });
    }

    public async stop() {
        if (this.server) {
            this.server.close();
        }

        this.server = null;
    }
}