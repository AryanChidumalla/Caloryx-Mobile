import exerciseData from "@/data/exercises.json";

const GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";

export const getExercises = () => {
  return exerciseData.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    bodyPart: item.body_part,
    equipment: item.equipment,
    instructions: item.instructions,
    instructionSteps: item.instruction_steps,
    muscleGroup: item.muscle_group,
    secondaryMuscles: item.secondary_muscles,
    target: item.target,

    image: item.image ? `${GITHUB_BASE_URL}${item.image}` : null,

    gifUrl: item.gif_url ? `${GITHUB_BASE_URL}${item.gif_url}` : null,

    mediaId: item.media_id,
    attribution: item.attribution,
    isCustom: false,
  }));
};

console.log("SERVICE IMAGE:", getExercises()[0].image);
