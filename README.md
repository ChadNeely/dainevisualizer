# Daine Visualizer

A responsive p5.js audio visualizer for a portrait background image.

## Run it

Because browsers block some audio features on `file://` pages, serve the folder:

```bash
cd dainevisualizer
python3 -m http.server 8000
```

Open `http://localhost:8000`.

Place optional `background.png` and `song.mp3` files in the project folder to use them automatically.

You can also use **Upload song** and **Upload background** directly in the page. Selected files stay in the browser and are not uploaded anywhere.