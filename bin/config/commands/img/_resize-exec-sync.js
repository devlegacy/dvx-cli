// execSync(`sh -c \"mogrify -verbose -format jpg -layers Dispose -resize '1024>' ${srcDir.replace(/\\/g, '\\\\\\').toString()}/**/*.jpg;
  //                   mogrify -verbose -format png -resize '1024>' ${srcDir.replace(/\\/g, '\\\\\\').toString()}/**/*.png;
  //                   mogrify -verbose -format jpeg -layers Dispose -resize '1024>' ${srcDir.replace(/\\/g, '\\\\\\').toString()}/**/*.jpeg;\"`,
  //   (err, stdout, stderr) => {
  //     console.log("err: ", err);
  //     console.log("stdout: ", stdout);
  //     console.log("stderr: ", stderr);
  //     // if (err) { notifyError(err); }
  //   });
