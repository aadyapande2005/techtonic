import connectdb from './db.js';
import { createMultiplePostsForUser } from './controllers/post/createMultiplePostsForUser.js';

const dummyPosts = {
    aadya: [
        {
            title: 'Modern landing page',
            description: 'Building a clean homepage with strong visual hierarchy.',
            topics: ['web development', 'ui', 'frontend']
        },
        {
            title: 'Chatbot prototype',
            description: 'Testing a simple assistant for user support.',
            topics: ['ai', 'nlp', 'chatbots']
        },
        {
            title: 'Sales dashboard',
            description: 'Tracking metrics with charts and filters.',
            topics: ['data science', 'analytics', 'dashboard']
        },
        {
            title: 'Password security',
            description: 'Reviewing safer ways to store credentials.',
            topics: ['cyber security', 'authentication', 'backend']
        },
        {
            title: 'React component system',
            description: 'Organizing reusable UI pieces for scale.',
            topics: ['web development', 'react', 'frontend']
        },
        {
            title: 'Model training basics',
            description: 'Experimenting with a small classification model.',
            topics: ['ml', 'training', 'python']
        },
        {
            title: 'Data cleaning pass',
            description: 'Preparing messy data for analysis.',
            topics: ['data science', 'data cleaning', 'pandas']
        },
        {
            title: 'Secure login flow',
            description: 'Adding safer authentication steps.',
            topics: ['cyber security', 'auth', 'web development']
        },
        {
            title: 'API performance tuning',
            description: 'Reducing response time on key endpoints.',
            topics: ['web development', 'api', 'performance']
        },
        {
            title: 'Image classifier test',
            description: 'Checking how well the model spots objects.',
            topics: ['ai/ml', 'computer vision', 'deep learning']
        },
        {
            title: 'Exploratory data analysis',
            description: 'Finding patterns in a new dataset.',
            topics: ['data science', 'eda', 'visualization']
        },
        {
            title: 'Threat detection notes',
            description: 'Looking at unusual activity patterns.',
            topics: ['cyber security', 'threat detection', 'monitoring']
        }
    ],
    aadya2: [
        {
            title: 'Responsive navigation',
            description: 'Making menus work well on all screens.',
            topics: ['web development', 'responsive design', 'css']
        },
        {
            title: 'Recommendation engine idea',
            description: 'Drafting a basic content suggestion system.',
            topics: ['ai/ml', 'recommendation systems', 'data']
        },
        {
            title: 'Python notebook cleanup',
            description: 'Organizing analysis steps into clear sections.',
            topics: ['data science', 'python', 'jupyter']
        },
        {
            title: 'Vulnerability scan review',
            description: 'Checking for common security risks.',
            topics: ['cyber security', 'vulnerability', 'audit']
        },
        {
            title: 'State management plan',
            description: 'Choosing a better way to share app state.',
            topics: ['web development', 'state management', 'react']
        },
        {
            title: 'Fine-tuning experiment',
            description: 'Trying a smaller training setup for accuracy.',
            topics: ['ai/ml', 'fine-tuning', 'nlp']
        },
        {
            title: 'Business insights report',
            description: 'Summarizing trends for a quick read.',
            topics: ['data science', 'business intelligence', 'reporting']
        },
        {
            title: 'JWT hardening',
            description: 'Improving token handling for the app.',
            topics: ['cyber security', 'jwt', 'authentication']
        },
        {
            title: 'Frontend form validation',
            description: 'Making input errors easier to catch.',
            topics: ['web development', 'forms', 'validation']
        },
        {
            title: 'Tensor demo',
            description: 'Running a quick neural network example.',
            topics: ['ai/ml', 'neural networks', 'tensorflow']
        },
        {
            title: 'A/B test analysis',
            description: 'Comparing two versions of a feature.',
            topics: ['data science', 'experimentation', 'statistics']
        },
        {
            title: 'Phishing awareness',
            description: 'Reviewing common social engineering tricks.',
            topics: ['cyber security', 'phishing', 'awareness']
        }
    ]
};

const run = async () => {
    try {
        await connectdb();

        const results = [];

        for (const [username, posts] of Object.entries(dummyPosts)) {
            results.push(await createMultiplePostsForUser({ username, posts }));
        }

        console.log(JSON.stringify(results, null, 2));
        process.exitCode = 0;
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
};

run();