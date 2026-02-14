{ pkgs, ... }: {
  # 利用するパッケージ（静的サーバーとしてPythonを使用）
  channel = "stable-24.05";
  packages = [
    pkgs.python3
  ];

  # IDXのプレビュー設定
  idx = {
    extensions = [];
    previews = {
      enable = true;
      previews = {
        web = {
          # webフォルダをルートとしてサーバーを起動します
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