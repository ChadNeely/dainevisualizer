# Daine Visualizer

A responsive p5.js audio visualizer for a portrait background image.

## Run it

Because browsers block some audio features on `file://` pages, serve the folder:

```bash
cd dainevisualizer
python3 -m http.server 8000
```

Open `http://localhost:8000`.

The page can start with these optional files in the project folder:

- `background.png`
- `song.mp3`

You can also use **Upload song** and **Upload background** directly in the page. Audio selected this way is local to the browser and is not uploaded anywhere.