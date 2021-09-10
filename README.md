# strv.dev

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

## ディレクトリ構成
### `assets`
Sassや画像、Fontなど、未コンパイルのアセットを入れる場所。

### `components`
Vue.jsのコンポーネントを入れる場所。再利用可能性が少しでもあるものはここ。
`.vue`

#### `atoms`
アトミックな最小単位コンポーネントの配置場所。

#### `molecules`
状態を内部に持ち、プロパティ( Props )を介して外部とやり取りするような、相互依存がコンポーネント内に閉じられるものの配置場所。

#### `organisms`
atoms と molecules によって構成される複合体であり、外部状態( Vuex の Global State , Composition API の Provide / Inject など)に依存するような、明確に意味を持つ大きな塊のコンポーネントを配置する場所。

### `composables`
各種コンポーネントから分離されたデータへのアクセスやロジックを配置する場所。

#### `repositories`
データアクセスの具体実装を Repository 実装で抽象化するコードを配置する場所。

#### `stores`
Provide / Inject を利用したデータアクセスのインターフェイスを定義する場所。

#### `utils`
コンポーネントから分離されたロジックが配置される場所

### `layouts`
サイドバーやヘッダー、フッターなど、ページを横断して利用するレイアウトコンポーネントを入れる場所。
`.vue`

### `pages`
特定の機能を実装したページ全体を実装するのコンポーネントを入れる場所。基本的に再利用しない。
`.vue`

### `plugins`
Vue プラグインなどを配置する場所。たとえば Vue.use() などを行うコードはここに入れる。

### `static`
静的ファイルを配置する場所。配置されたファイルは`/`にマッピングされる。

### `store`
Vuex の Store ファイルが格納される場所。
