# Custom Reward Blendshape Sender
Twitchのカスタム報酬の交換をトリガーにし、VMC/OSC Protocol経由でBlendShapeを操作するアプリケーション（？）  

VirtualMotionCaptureで読み込まれているVRMアバターに対して、BlendShapeを操作する想定のアプリです。  
他にはVSeeFaceなどVMC/OSC ProtocolでのBlendShape受信機能があるものに関しては概ね使用できるかと思います。  

- NalulunaAvatarsでは動作未確認。（BlendShapeだけ受信の形が想定されてなさそうなので不可？）
- VRChatのOSCには未対応です。

## 準備

### Twitch接続情報の取得

[こちら](https://www.twitch.tv/login?client_id=ex4s5g39esd8d4gz7d881sx2ih5vpv&redirect_params=client_id%3Dex4s5g39esd8d4gz7d881sx2ih5vpv%26redirect_uri%3Dhttps%253A%252F%252Fmeplauir.github.io%252Ftwitch-redirect-page%252F%26response_type%3Dtoken%26scope%3Duser%253Aread%253Aemail%2Bchannel%253Aread%253Aredemptions%2Bchannel%253Aread%253Asubscriptions)
からTwitchにログインし、「Twitch設定値のダウンロード」からtwitch_config.jsonを取得してください。  

**※ アカウントに紐づく情報です。取り扱い注意です。**

### Twitch接続情報の配置

(パス)にtwitch_config.jsonを配置する。

## 使い方
