const fs = require("fs");
const path = require("path");

const exercisesDir = path.join(__dirname, "..", "public", "exercises");
const outputFile = path.join(__dirname, "..", "public", "exerciseList.json");

function generateExerciseManifest() {
  if (!fs.existsSync(exercisesDir)) {
    console.error(`Directory '${exercisesDir}' does not exist.`);
    process.exit(1);
  }

  const files = fs.readdirSync(exercisesDir).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ext === ".pdf";
  });

  files.sort(); // optional: sort alphabetically

  fs.writeFileSync(outputFile, JSON.stringify(files, null, 2), "utf-8");
  console.log(
    `Manifest generated with ${files.length} files at '${outputFile}'.`
  );
}

generateExerciseManifest();
