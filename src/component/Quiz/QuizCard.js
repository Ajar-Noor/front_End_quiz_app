import React, { useEffect, useReducer, useState } from 'react'
import QuizQuestions from './QuizApi'


const initialState = { questions: QuizQuestions, quizQuestionIndex: 0, selectedOptions: Array(QuizQuestions.length).fill(null) }

const reducer = (state, action) => {
    switch (action.type) {
        case 'SELECT_OPTION':
            const { questionIndex, optionIndex } = action.payload;
            const newSelectedOptions = [...state.selectedOptions];
            newSelectedOptions[questionIndex] = optionIndex;
            return { ...state, selectedOptions: newSelectedOptions };

        case 'NEXT_QUESTION':
            console.log('Next question action dispatched');
            const nextQuestionIndex = state.quizQuestionIndex + 1;
            if (nextQuestionIndex < state.questions.length) {
                return { ...state, quizQuestionIndex: nextQuestionIndex };
            }
            break;
        case 'SKIP_QUESTION':
            const skipQuestionIndex = state.quizQuestionIndex + 1;
            if (skipQuestionIndex < state.questions.length) {
                return { ...state, quizQuestionIndex: skipQuestionIndex };
            }
            break;

        case 'SUBMIT_QUIZ':
            return { ...state, quizSubmitted: true };


        default:
            return state;
    }
}

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const QuizCard = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const currentQuestion = state.questions[state.quizQuestionIndex];
    const [selectedOption, setSelectedOption] = useState(Array(state.questions.length).fill(null));
    const [timeRemaining, setTimeRemaining] = useState(150);
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prevTime) => Math.max(0, prevTime - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (timeRemaining <= 0) {
            submitQuiz();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRemaining]);

    const handleOnNextQuestion = () => {
        dispatch({ type: 'NEXT_QUESTION' });
        // setSelectedOption(Array(state.questions.length).fill(null));
    };

    const handleOptionSelect = (optionIndex) => {
        dispatch({
            type: 'SELECT_OPTION',
            payload: { questionIndex: state.quizQuestionIndex, optionIndex },
        });
        setSelectedOption((prevSelectedOptions) => {
            const newSelectedOptions = [...prevSelectedOptions];
            newSelectedOptions[state.quizQuestionIndex] = optionIndex;
            return newSelectedOptions;
        });
    };


    const handleOnSkipQuestion = () => {
        dispatch({ type: 'SKIP_QUESTION' });
        setSelectedOption((prevSelectedOptions) => {
            const newSelectedOptions = [...prevSelectedOptions];
            newSelectedOptions[state.quizQuestionIndex] = null; // Set the selected option to null when skipping
            return newSelectedOptions;
        });
    };

    const submitQuiz = () => {
        dispatch({ type: 'SUBMIT_QUIZ' });

        if (timeRemaining <= 0 || state.quizQuestionIndex === state.questions.length - 1) {

            console.log('Quiz submitted!');
            setTimeRemaining(0); // Stop the timer
        }
    };

    const calculateScore = () => {
        let score = 0;
        for (let i = 0; i < state.questions.length; i++) {
            const correctOptionIndex = state.questions[i].answer.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
            if (selectedOption[i] === correctOptionIndex) {
                score++;
            }
        }
        return score;
    };

    const handleOnShowCorrectAnswers = () => {
        setShowCorrectAnswers(true);
        setCurrentQuestionIndex(0);

        const correctOptionIndices = state.questions.map(question => question.correctOptionIndex);

        const updatedSelectOptions = selectedOption.map((selected, index) =>
            showCorrectAnswers && selected !== correctOptionIndices[index]
                ? correctOptionIndices[index]
                : selected !== null && selected !== correctOptionIndices[index]
                    ? -1
                    : selected
        )
        setSelectedOption(updatedSelectOptions)
    }

    const handleShowNextAnswer = () => {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    };


    return (
        <div className='mx-auto grid'>
            <div>
                <span>Quiz App</span>
                <div>
                    <p>Time Remaining: {formatTime(timeRemaining)}</p>
                </div>
                <span>{state.quizQuestionIndex + 1}/{state.questions.length}</span>
            </div>

            {state.quizSubmitted ? (
                <>
                    <h2>Quiz Results</h2>
                    <p>Total Score: {calculateScore()} out of {state.questions.length}</p>
                    <button onClick={handleOnShowCorrectAnswers} className='cursor-pointer ml-10 bg-[white] shadow-xl rounded-xl h-[40px] w-[200px]'>
                        Show Correct Answers
                    </button>
                    {showCorrectAnswers && (
                        <>
                            <h2>Correct Answers</h2>
                            {state.questions.map((question, questionIndex) => (
                                <div key={questionIndex} className={questionIndex === currentQuestionIndex ? '' : 'hidden'}>
                                    <h3>{question.question}</h3>
                                    {['optionA', 'optionB', 'optionC', 'optionD'].map((option, index) => {
                                        const selected = selectedOption[questionIndex] === index;
                                        const isCorrectAnswer = question.correctOptionIndex === index;
                                        const isIncorrectSelected = selected && selectedOption[questionIndex] === -1;
                                        const isCorrectSelected = selected && isCorrectAnswer;

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '0.625rem',
                                                    margin: '0.313rem',
                                                    borderWidth: '1px',
                                                    borderColor: '#ccc',
                                                    backgroundColor: isCorrectSelected
                                                        ? 'green' // Highlight correct answer
                                                        : isIncorrectSelected
                                                            ? 'red' // Highlight incorrect answer
                                                            : selected
                                                                ? '#3498db' // Highlight selected option
                                                                : 'transparent',
                                                    color: showCorrectAnswers && isCorrectAnswer ? 'white' : 'black',
                                                }}
                                                className={`hover:bg-gray-200 transition-colors ${showCorrectAnswers && isCorrectAnswer ? 'selected' : ''}`}
                                            >
                                                {question[option]}
                                            </div>
                                        );
                                    })}

                                    <button onClick={handleShowNextAnswer} className='cursor-pointer bg-[white] shadow-xl rounded-xl h-[40px] w-[150px]'>
                                        Show Next Answer
                                    </button>


                                </div>
                            ))}
                        </>
                    )}

                </>

            ) : (
                <div>
                    <h2>{currentQuestion.question}</h2>
                    {['optionA', 'optionB', 'optionC', 'optionD'].map((option, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '0.625rem',
                                margin: '0.313rem',
                                borderWidth: '1px',
                                borderColor: '#ccc',
                                cursor: 'pointer',
                                backgroundColor: selectedOption[state.quizQuestionIndex] === index ? '#3498db' : 'transparent',
                                color: selectedOption[state.quizQuestionIndex] === index ? 'white' : 'black',
                            }}
                            className={`hover:bg-gray-200 transition-colors ${selectedOption[state.quizQuestionIndex] === index ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect(index)}
                        >
                            {currentQuestion[option]}
                        </div>
                    ))}

                    {state.quizQuestionIndex < state.questions.length - 1 &&
                        <button onClick={handleOnNextQuestion} disabled={selectedOption[state.quizQuestionIndex] === null} className='cursor-pointer'>
                            Next
                        </button>
                    }

                    {state.quizQuestionIndex < state.questions.length - 1 &&
                        <button onClick={handleOnSkipQuestion} className='cursor-pointer ml-10'>
                            Skip
                        </button>
                    }


                    {state.quizQuestionIndex === state.questions.length - 1 && (
                        <button onClick={submitQuiz} className='cursor-pointer'>
                            Submit
                        </button>
                    )}
                </div>
            )}
        </div>

    );
}

export default QuizCard;





