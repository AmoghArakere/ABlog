// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && window.localStorage;

// Safe localStorage getter
const getFromStorage = (key, defaultValue = '[]') => {
  if (!isBrowser) return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Safe localStorage setter
const setToStorage = (key, value) => {
  if (!isBrowser) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
};

// Sample data for the blog
export const initializeSampleData = () => {
  // Check if we're in a browser environment
  if (!isBrowser) return;

  // Check if data is already initialized
  if (getFromStorage('dataInitialized', null)) {
    return;
  }

  // Sample users
  const users = [
    {
      id: '1',
      email: 'john@example.com',
      password: 'password123',
      username: 'johndoe',
      full_name: 'John Doe',
      avatar_url: '/images/placeholder-profile.svg',
      bio: 'Web Developer | Tech Enthusiast | Coffee Lover',
      website: 'https://johndoe.com',
      location: 'San Francisco, CA',
      created_at: '2023-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      email: 'jane@example.com',
      password: 'password123',
      username: 'janesmith',
      full_name: 'Jane Smith',
      avatar_url: '/images/placeholder-profile.svg',
      bio: 'UX Designer | Creative Thinker | Dog Person',
      website: 'https://janesmith.com',
      location: 'New York, NY',
      created_at: '2023-01-02T00:00:00.000Z'
    },
    {
      id: '3',
      email: 'alex@example.com',
      password: 'password123',
      username: 'alexjohnson',
      full_name: 'Alex Johnson',
      avatar_url: '/images/placeholder-profile.svg',
      bio: 'Product Manager | Tech Blogger | Fitness Enthusiast',
      website: 'https://alexjohnson.com',
      location: 'Seattle, WA',
      created_at: '2023-01-03T00:00:00.000Z'
    }
  ];

  // Sample categories
  const categories = [
    {
      id: '1',
      name: 'Technology',
      slug: 'technology',
      description: 'Tech-related posts'
    },
    {
      id: '2',
      name: 'Design',
      slug: 'design',
      description: 'Design-related posts'
    },
    {
      id: '3',
      name: 'Business',
      slug: 'business',
      description: 'Business-related posts'
    },
    {
      id: '4',
      name: 'Health',
      slug: 'health',
      description: 'Health-related posts'
    },
    {
      id: '5',
      name: 'Productivity',
      slug: 'productivity',
      description: 'Productivity tips and tricks'
    }
  ];

  // Sample tags
  const tags = [
    { id: '1', name: 'JavaScript', slug: 'javascript' },
    { id: '2', name: 'React', slug: 'react' },
    { id: '3', name: 'CSS', slug: 'css' },
    { id: '4', name: 'Web Development', slug: 'web-development' },
    { id: '5', name: 'UI/UX', slug: 'ui-ux' },
    { id: '6', name: 'Productivity', slug: 'productivity' },
    { id: '7', name: 'Career', slug: 'career' },
    { id: '8', name: 'Health', slug: 'health' },
    { id: '9', name: 'Fitness', slug: 'fitness' },
    { id: '10', name: 'Business', slug: 'business' }
  ];

  // Sample posts
  const posts = [
    {
      id: '1',
      title: 'Getting Started with Web Development',
      slug: 'getting-started-with-web-development',
      content: `
        <h2>Introduction to Web Development</h2>
        <p>Web development is the work involved in developing a website for the Internet or an intranet. Web development can range from developing a simple single static page of plain text to complex web applications, electronic businesses, and social network services.</p>

        <h3>Front-end Development</h3>
        <p>Front-end web development, also known as client-side development, is the practice of producing HTML, CSS and JavaScript for a website or Web Application so that a user can see and interact with them directly.</p>

        <h3>Back-end Development</h3>
        <p>Back-end development covers server-side web application logic and integration and activities, like writing APIs, creating libraries, and working with system components instead of the frontend code, which is what the user sees.</p>

        <h2>Essential Technologies</h2>
        <h3>HTML</h3>
        <p>HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It defines the structure of web content.</p>

        <pre><code>
        &lt;!DOCTYPE html&gt;
        &lt;html&gt;
        &lt;head&gt;
            &lt;title&gt;My First Web Page&lt;/title&gt;
        &lt;/head&gt;
        &lt;body&gt;
            &lt;h1&gt;Hello, World!&lt;/h1&gt;
            &lt;p&gt;This is my first web page.&lt;/p&gt;
        &lt;/body&gt;
        &lt;/html&gt;
        </code></pre>

        <h3>CSS</h3>
        <p>CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in HTML. CSS is designed to enable the separation of presentation and content.</p>

        <pre><code>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }

        h1 {
            color: #333;
            text-align: center;
        }

        p {
            line-height: 1.6;
            color: #666;
        }
        </code></pre>

        <h3>JavaScript</h3>
        <p>JavaScript is a programming language that conforms to the ECMAScript specification. JavaScript is high-level, often just-in-time compiled, and multi-paradigm.</p>

        <pre><code>
        // Simple JavaScript example
        function greet(name) {
            return \`Hello, \${name}!\`;
        }

        console.log(greet('World')); // Output: Hello, World!

        // DOM manipulation
        document.getElementById('demo').innerHTML = greet('Web Developer');
        </code></pre>

        <h2>Getting Started</h2>
        <p>To get started with web development, you'll need a few tools:</p>
        <ul>
            <li>A text editor or IDE (like VS Code, Sublime Text, or Atom)</li>
            <li>A web browser (like Chrome, Firefox, or Edge)</li>
            <li>Basic knowledge of HTML, CSS, and JavaScript</li>
        </ul>

        <p>Start by creating a simple HTML file, then add some CSS to style it, and finally add some JavaScript to make it interactive. As you get more comfortable, you can explore frameworks like React, Angular, or Vue.js for front-end development, and Node.js, Django, or Ruby on Rails for back-end development.</p>

        <h2>Conclusion</h2>
        <p>Web development is an exciting field with endless possibilities. Whether you're interested in building websites, web applications, or mobile apps, the skills you learn in web development will be valuable. Start small, be consistent, and don't be afraid to experiment and learn from your mistakes.</p>
      `,
      excerpt: 'Learn the basics of HTML, CSS, and JavaScript to kickstart your web development journey.',
      cover_image: '/images/placeholder-blog.svg',
      author_id: '1',
      author: users[0],
      categories: [categories[0]],
      tags: [tags[0], tags[2], tags[3]],
      status: 'published',
      created_at: '2023-04-01T00:00:00.000Z',
      updated_at: '2023-04-01T00:00:00.000Z'
    },
    {
      id: '2',
      title: 'UI/UX Design Principles for Beginners',
      slug: 'ui-ux-design-principles-for-beginners',
      content: `
        <h2>Introduction to UI/UX Design</h2>
        <p>UI (User Interface) and UX (User Experience) design are two critical aspects of creating digital products that are both visually appealing and easy to use. While they are often mentioned together, they refer to different aspects of the design process.</p>

        <h3>What is UI Design?</h3>
        <p>UI design focuses on the visual elements of a digital product, such as buttons, icons, spacing, typography, color schemes, and responsive design. A good UI designer ensures that the interface is attractive, consistent, and aligns with the brand's identity.</p>

        <h3>What is UX Design?</h3>
        <p>UX design is about the overall feel of the experience. It's less about how a product looks and more about how it works. UX designers focus on the user's journey to solve a problem, the steps they take to accomplish a task, and the feelings they experience during the process.</p>

        <h2>Core Principles of UI Design</h2>

        <h3>1. Clarity</h3>
        <p>The interface should be clear and easy to understand. Users should be able to recognize elements and understand their purpose without having to think too much.</p>

        <h3>2. Consistency</h3>
        <p>Consistency in design creates familiarity and comfort. Use consistent elements, patterns, and styles throughout your interface to help users learn and navigate your product more easily.</p>

        <h3>3. Visual Hierarchy</h3>
        <p>Visual hierarchy guides users through the interface by emphasizing important elements and de-emphasizing less important ones. This can be achieved through size, color, contrast, and spacing.</p>

        <h3>4. Accessibility</h3>
        <p>Design for all users, including those with disabilities. Ensure your interface is usable by people with various impairments, such as visual, motor, or cognitive disabilities.</p>

        <h2>Core Principles of UX Design</h2>

        <h3>1. User-Centered Design</h3>
        <p>Always design with the user in mind. Understand their needs, goals, and pain points, and create solutions that address these effectively.</p>

        <h3>2. Simplicity</h3>
        <p>Keep it simple. Users appreciate interfaces that are easy to understand and use. Avoid unnecessary complexity and focus on the core functionality.</p>

        <h3>3. Feedback</h3>
        <p>Provide clear feedback for user actions. Users should always know what's happening in the system, whether their actions were successful, and what to do next.</p>

        <h3>4. Usability</h3>
        <p>Your product should be easy to use and learn. Users should be able to accomplish their goals efficiently and with minimal frustration.</p>

        <h2>The Design Process</h2>

        <h3>1. Research</h3>
        <p>Start by understanding your users, their needs, and the context in which they'll use your product. This can involve user interviews, surveys, and competitive analysis.</p>

        <h3>2. Wireframing</h3>
        <p>Create low-fidelity representations of your interface to explore different layouts and structures. Wireframes focus on functionality rather than visual design.</p>

        <h3>3. Prototyping</h3>
        <p>Build interactive prototypes to test your design solutions. Prototypes allow you to simulate the user experience and gather feedback before development.</p>

        <h3>4. Testing</h3>
        <p>Test your designs with real users to identify usability issues and areas for improvement. Iterate based on feedback to refine your design.</p>

        <h3>5. Implementation</h3>
        <p>Work with developers to bring your design to life. Provide detailed specifications and assets, and be available to answer questions and make adjustments as needed.</p>

        <h2>Tools for UI/UX Design</h2>
        <p>There are many tools available for UI/UX design, each with its own strengths and weaknesses. Some popular options include:</p>
        <ul>
            <li>Figma: A collaborative interface design tool</li>
            <li>Sketch: A vector-based design tool for macOS</li>
            <li>Adobe XD: A vector-based design tool for UI/UX</li>
            <li>InVision: A prototyping and collaboration tool</li>
            <li>Axure RP: A tool for creating interactive prototypes</li>
        </ul>

        <h2>Conclusion</h2>
        <p>UI/UX design is a complex but rewarding field that combines creativity with problem-solving. By focusing on the user and following established design principles, you can create digital products that are both beautiful and functional. Remember that design is an iterative process, and there's always room for improvement based on user feedback and changing needs.</p>
      `,
      excerpt: 'Discover the fundamental principles of creating user-friendly and visually appealing interfaces.',
      cover_image: '/images/placeholder-blog.svg',
      author_id: '2',
      author: users[1],
      categories: [categories[1]],
      tags: [tags[4]],
      status: 'published',
      created_at: '2023-03-28T00:00:00.000Z',
      updated_at: '2023-03-28T00:00:00.000Z'
    },
    {
      id: '3',
      title: '10 Tips to Boost Your Productivity',
      slug: '10-tips-to-boost-your-productivity',
      content: `
        <h2>Introduction</h2>
        <p>In today's fast-paced world, productivity is more important than ever. Whether you're a student, professional, or entrepreneur, being able to accomplish more in less time can significantly impact your success and well-being. This article shares ten practical tips to help you boost your productivity and make the most of your time.</p>

        <h2>1. Start Your Day with a Plan</h2>
        <p>One of the most effective ways to increase productivity is to start each day with a clear plan. Take a few minutes each morning (or the night before) to outline your tasks for the day. Prioritize them based on importance and urgency, and set realistic goals for what you want to accomplish.</p>

        <h2>2. Use the Pomodoro Technique</h2>
        <p>The Pomodoro Technique is a time management method that involves working in focused bursts followed by short breaks. Typically, this means 25 minutes of concentrated work followed by a 5-minute break. After four cycles, take a longer break of 15-30 minutes. This technique helps maintain high levels of focus and prevents burnout.</p>

        <h2>3. Minimize Distractions</h2>
        <p>Distractions are productivity killers. Identify what typically distracts you and take steps to minimize these interruptions. This might mean turning off notifications, using website blockers, or finding a quiet place to work. Creating a distraction-free environment allows you to focus more deeply on your tasks.</p>

        <h2>4. Practice the Two-Minute Rule</h2>
        <p>If a task takes less than two minutes to complete, do it immediately rather than adding it to your to-do list. This simple rule, popularized by productivity expert David Allen, helps prevent small tasks from piling up and becoming overwhelming.</p>

        <h2>5. Batch Similar Tasks</h2>
        <p>Task batching involves grouping similar activities together and completing them in one go. For example, you might designate specific times for checking emails, making phone calls, or attending meetings. This reduces the mental effort required to switch between different types of tasks and increases efficiency.</p>

        <h2>6. Take Regular Breaks</h2>
        <p>While it might seem counterintuitive, taking regular breaks actually improves productivity. Short breaks help prevent mental fatigue, maintain consistent performance, and reduce stress. Step away from your work, stretch, move around, or engage in a brief relaxing activity before returning to your tasks.</p>

        <h2>7. Learn to Say No</h2>
        <p>Taking on too many commitments is a common productivity pitfall. Learn to say no to tasks or projects that don't align with your priorities or that you don't have the capacity to handle. This allows you to focus your energy on what truly matters and deliver better results.</p>

        <h2>8. Use Technology Wisely</h2>
        <p>There are countless productivity tools and apps available today. Find the ones that work best for you and incorporate them into your routine. This might include task managers, calendar apps, note-taking tools, or automation software. However, be careful not to get caught up in trying too many tools, as this can become a distraction in itself.</p>

        <h2>9. Prioritize Self-Care</h2>
        <p>Productivity isn't just about working more; it's about working better. Taking care of your physical and mental health is essential for sustained productivity. Ensure you're getting enough sleep, eating well, exercising regularly, and managing stress effectively. A healthy body and mind are the foundation of productive work.</p>

        <h2>10. Reflect and Adjust</h2>
        <p>Regularly review your productivity strategies and results. What's working well? What could be improved? Be willing to adjust your approach based on these reflections. Productivity is a personal journey, and finding what works best for you may require some experimentation.</p>

        <h2>Conclusion</h2>
        <p>Boosting your productivity isn't about cramming more work into your day; it's about working smarter, not harder. By implementing these ten tips, you can make better use of your time, reduce stress, and achieve more of what matters to you. Remember that productivity is a skill that improves with practice, so be patient with yourself as you develop these habits.</p>
      `,
      excerpt: 'Simple yet effective strategies to help you get more done in less time and reduce stress.',
      cover_image: '/images/placeholder-blog.svg',
      author_id: '3',
      author: users[2],
      categories: [categories[4]],
      tags: [tags[5], tags[6]],
      status: 'published',
      created_at: '2023-04-03T00:00:00.000Z',
      updated_at: '2023-04-03T00:00:00.000Z'
    }
  ];

  // Sample comments
  const comments = [
    {
      id: '1',
      post_id: '1',
      author_id: '2',
      author: users[1],
      content: 'Great introduction to web development! This is exactly what I needed when I was starting out.',
      created_at: '2023-04-02T10:00:00.000Z'
    },
    {
      id: '2',
      post_id: '1',
      author_id: '3',
      author: users[2],
      content: 'I would also recommend learning about responsive design early on. It\'s so important for modern web development.',
      created_at: '2023-04-02T11:30:00.000Z'
    },
    {
      id: '3',
      post_id: '2',
      author_id: '1',
      author: users[0],
      content: 'These principles have been really helpful in my recent projects. Thanks for sharing!',
      created_at: '2023-03-29T09:15:00.000Z'
    },
    {
      id: '4',
      post_id: '3',
      author_id: '1',
      author: users[0],
      content: 'The Pomodoro Technique has been a game-changer for me. I\'ve been using it for a month now and my productivity has improved significantly.',
      created_at: '2023-04-04T14:20:00.000Z'
    },
    {
      id: '5',
      post_id: '3',
      author_id: '2',
      author: users[1],
      content: 'I\'ve been struggling with distractions lately. Going to try implementing some of these tips, especially the idea of batching similar tasks.',
      created_at: '2023-04-04T16:45:00.000Z'
    }
  ];

  // Sample likes
  const likes = [
    { id: '1', post_id: '1', user_id: '2', created_at: '2023-04-02T09:30:00.000Z' },
    { id: '2', post_id: '1', user_id: '3', created_at: '2023-04-02T14:15:00.000Z' },
    { id: '3', post_id: '2', user_id: '1', created_at: '2023-03-28T16:20:00.000Z' },
    { id: '4', post_id: '2', user_id: '3', created_at: '2023-03-29T11:10:00.000Z' },
    { id: '5', post_id: '3', user_id: '1', created_at: '2023-04-03T15:45:00.000Z' },
    { id: '6', post_id: '3', user_id: '2', created_at: '2023-04-04T10:30:00.000Z' }
  ];

  // Sample bookmarks
  const bookmarks = [
    { id: '1', post_id: '1', user_id: '2', created_at: '2023-04-02T09:35:00.000Z' },
    { id: '2', post_id: '2', user_id: '3', created_at: '2023-03-28T17:00:00.000Z' },
    { id: '3', post_id: '3', user_id: '1', created_at: '2023-04-03T16:00:00.000Z' }
  ];

  // Sample follows
  const follows = [
    { id: '1', follower_id: '2', following_id: '1', created_at: '2023-02-15T00:00:00.000Z' },
    { id: '2', follower_id: '3', following_id: '1', created_at: '2023-02-20T00:00:00.000Z' },
    { id: '3', follower_id: '1', following_id: '2', created_at: '2023-02-25T00:00:00.000Z' },
    { id: '4', follower_id: '3', following_id: '2', created_at: '2023-03-01T00:00:00.000Z' },
    { id: '5', follower_id: '1', following_id: '3', created_at: '2023-03-05T00:00:00.000Z' },
    { id: '6', follower_id: '2', following_id: '3', created_at: '2023-03-10T00:00:00.000Z' }
  ];

  // Store data in localStorage
  setToStorage('users', JSON.stringify(users));
  setToStorage('categories', JSON.stringify(categories));
  setToStorage('tags', JSON.stringify(tags));
  setToStorage('posts', JSON.stringify(posts));
  setToStorage('comments', JSON.stringify(comments));
  setToStorage('likes', JSON.stringify(likes));
  setToStorage('bookmarks', JSON.stringify(bookmarks));
  setToStorage('follows', JSON.stringify(follows));

  // Mark data as initialized
  setToStorage('dataInitialized', 'true');

  console.log('Sample data initialized successfully!');
};
