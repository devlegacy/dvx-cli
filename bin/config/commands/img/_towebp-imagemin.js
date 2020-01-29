imagemin([file], `${dist}`, {
  use: [
    imageminWebp()
  ]
})
  .then(data => {
    // console.log(`[WebP]: Imagenes optimizadas: ${file}`);
    flog(data[0].path);
  })
  .catch(err => console.log(`[Error]: ${err}`));
(async () => {
  const images = await imagemin([file], `${dist}`, {
    plugins: [
      imageminWebp(),
    ]
  });
  console.log(images[0].path);
  //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
})();
