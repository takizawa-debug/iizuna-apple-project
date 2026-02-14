{ pkgs, ... }: {
  # 安定したチャンネルを指定
  channel = "stable-24.05";
  
  packages = [
    pkgs.python3
    pkgs.nodejs_20
    # 一旦、ここでパッケージとして追加するのをやめ、後ほど別の方法でclaspを有効にします
  ];

  idx = {
    extensions = [];
    previews = {
      enable = true;
      previews = {
        web = {
          # webフォルダをルートとして起動
          command = ["python3" "-m" "http.server" "$PORT" "--bind" "0.0.0.0"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };
  };
}