#  Node.js e-Stat Client

This is a Node.js client for [e-Stat](https://www.e-stat.go.jp/).

## Prerequisite

1. Create your account at https://www.e-stat.go.jp/
2. issue an application ID at https://www.e-stat.go.jp/mypage/view/api
3. feed the application ID as `ESTAT_APP_ID` as an environmental variable or  as `options.appId` when client instanciation

## Useage

```typescript
import { Client } from '@kamataryo/e-stat-client'

const client = new Client({ appId: YOUR_APP_ID_VALUE })
await client.getStatsList({ limit: 10 })
```
