# DocScanner Web Example

```js
import { DocScanner } from '@docscanner/sdk-web';

const scanner = new DocScanner();
await scanner.start(document.getElementById('preview'));
const result = await scanner.capture(); // crops to white rectangle
```
