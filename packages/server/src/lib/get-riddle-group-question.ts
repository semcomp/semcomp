export const getRiddleGroupQuestion = function (group, index) {
  const completedQuestionsIndexes = group.completedQuestionsIndexes;
  let currentQuestionIndex = 0;
  if (completedQuestionsIndexes.length > 0) {
    currentQuestionIndex =
      completedQuestionsIndexes.reduce((a, b) => (a.index > b.index ? a : b))
        .index + 1;
  }

  const isFirstQuestion = index === 0;
  const isQuestionCompleted = currentQuestionIndex > index;
  const isQuestionInProgress = currentQuestionIndex === index;
  const isClueUsedInQuestion = group.usedClueIndexes.includes(index);

  return {
    currentQuestionIndex,
    isFirstQuestion,
    isQuestionInProgress,
    isQuestionCompleted,
    isClueUsedInQuestion,
  };
};
