# DocScannerSDK-Web

Browser document scanner. Draws a **white crop rectangle** over the camera
preview and crops with canvas on capture.

```bash
npm i @docscanner/sdk-web
```

```ts
const scanner = new DocScanner();
await scanner.start(container);
const { frontImageDataUrl } = await scanner.capture();
```

## License

MIT
