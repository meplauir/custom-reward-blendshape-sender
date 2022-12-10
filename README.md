# Twitchのカスタム報酬でBlendShapeを送るやつ
チャンネルポイントでのカスタム報酬引き換えをトリガーにして、指定IPアドレスにVMC/OSC ProtocolでBlendShapeを送信します。

## 使用例
- VirtualMotionCaptureで読み込み中のアバターのBlendShapeを操作
- VSeeFaceで読み込み中のアバターのBlendShapeを操作

※BeatSaberのMOD、NalulunaAvatarsでは動作未確認。  
※VRChatのOSCには未対応です。

## 動作確認環境
Window10 Pro 64bit バージョン:21H2

## 準備

### Twitch接続情報の取得

[こちら](https://www.twitch.tv/login?client_id=ex4s5g39esd8d4gz7d881sx2ih5vpv&redirect_params=client_id%3Dex4s5g39esd8d4gz7d881sx2ih5vpv%26redirect_uri%3Dhttps%253A%252F%252Fmeplauir.github.io%252Ftwitch-redirect-page%252F%26response_type%3Dtoken%26scope%3Duser%253Aread%253Aemail%2Bchannel%253Aread%253Aredemptions%2Bchannel%253Aread%253Asubscriptions)
からTwitchにログインし、「Twitch設定値のダウンロード」からtwitch_config.jsonを取得してください。  

**※ アカウントに紐づく情報です。取り扱いに注意してください。**

### Twitch接続情報の配置

解凍したフォルダ内の```\resources\app\config```にtwitch_config.jsonを配置する。  
**※configディレクトリ用のショートカットファイルを配置してます。（Twitch設定ファイル配置場所.lnk）**

## 使い方

(WikiのURL)
