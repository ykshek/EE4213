/* Shared static mock data adapted from original/ prototypes.
 * Comparator meetings use whole-hour demo slots: Class (lecture), Lab and
 * Project last three hours; Tutorial lasts one hour. These are not official times.
 */
(function (global) {
    'use strict';

    const data = {
    "metadata": {
        "isMockData": true,
        "description": "Static prototype data adapted from original HTML prototypes, including illustrative Comparator fixtures with whole-hour demo meeting times; not official or live student/course records.",
        "sources": [
            "original/cityu-ee-guide.html",
            "original/EE4213_code_v6.html",
            "original/comparator/app.js"
        ]
    },
    "internships": [
        {
            "id": "ic-design",
            "title": { "zh": "IC 設計與半導體實習", "en": "IC Design & Semiconductor Internship" },
            "description": { 
                "zh": "參與晶片設計、驗證或測試流程，學習使用業界標準 EDA 工具，將課堂理論轉化為實作經驗。", 
                "en": "Participate in chip design, verification, or testing, learning industry-standard EDA tools and turning classroom theory into practical experience." 
            },
            "companies": [
                "ASM Pacific Technology",
                "Huawei Tech. Investment Co., Ltd (Internship Program)",
                "AITO TECHNOLOGY LTD (Internship Program)",
                "RediX Technology Company Limited (Internship Program)"
            ],
            "skills": ["Verilog", "VLSI Design", "C/C++"],
            "recommendedCourses": ["EE3220", "EE3122"]
        },
        {
            "id": "telecom",
            "title": { "zh": "通訊與網路實習", "en": "Telecommunications & Networking Internship" },
            "description": { 
                "zh": "參與 5G 網路架構、無線通訊系統測試或網路優化專案，了解現代通訊技術的實際部署。", 
                "en": "Participate in 5G network architecture, wireless system testing, or network optimization projects to understand real-world deployment of modern communications." 
            },
            "companies": [
                "Huawei Tech. Investment Co., Ltd (Internship Program)",
                "NTT Com Asia Limited (Internship Program)",
                "PCCW",
                "HKT"
            ],
            "skills": ["Network Protocols", "RF Engineering", "Python"],
            "recommendedCourses": ["EE3008", "EE4036"]
        },
        {
            "id": "power",
            "title": { "zh": "電力與能源系統實習", "en": "Power & Energy Systems Internship" },
            "description": { 
                "zh": "參與電力系統分析、再生能源整合或電網維護，探索可持續能源的工程解決方案。", 
                "en": "Participate in power system analysis, renewable energy integration, or grid maintenance, exploring engineering solutions for sustainable energy." 
            },
            "companies": [
                "CLP Power",
                "HK Electric",
                "Siemens",
                "Saint-Gobain Hong Kong Limited (Internship Program)"
            ],
            "skills": ["Power Systems", "MATLAB", "Control Theory"],
            "recommendedCourses": ["EE3123", "EE4101"]
        },
        {
            "id": "software-data",
            "title": { "zh": "軟體與資料分析實習", "en": "Software & Data Analytics Internship" },
            "description": { 
                "zh": "運用 Python、機器學習框架或雲端技術，處理大數據並開發企業級應用程式。", 
                "en": "Apply Python, machine learning frameworks, or cloud technologies to process big data and develop enterprise applications." 
            },
            "companies": [
                "HSBC Tech",
                "Meta",
                "SenseTime",
                "Seeds Financial Group (Internship Program)",
                "Third Bridge Group Limited (Internship Program)"
            ],
            "skills": ["Python", "SQL", "Machine Learning"],
            "recommendedCourses": ["EE4146", "EE4016 / EE5438"]
        },
        {
            "id": "embedded-iot",
            "title": { "zh": "嵌入式系統與物聯網實習", "en": "Embedded Systems & IoT Internship" },
            "description": { 
                "zh": "開發微控制器韌體、整合感測器，並將實體裝置連上雲端，參與智慧城市或智慧家居專案。", 
                "en": "Develop microcontroller firmware, integrate sensors, and connect physical devices to the cloud in smart city or smart home projects." 
            },
            "companies": [
                "DJI",
                "Philips",
                "Techtronic Industries",
                "AWIL Group Limited (Internship Program)"
            ],
            "skills": ["C/C++", "Microcontrollers", "RTOS"],
            "recommendedCourses": ["EE2004", "EE3122"]
        },
        {
            "id": "ai-signal",
            "title": { "zh": "人工智慧與訊號處理實習", "en": "AI & Signal Processing Internship" },
            "description": { 
                "zh": "將數位訊號處理與深度學習技術應用於電腦視覺、語音辨識或醫療影像分析。", 
                "en": "Apply digital signal processing and deep learning techniques to computer vision, speech recognition, or medical image analysis." 
            },
            "companies": [
                "NVIDIA",
                "Lenovo",
                "HKUST Research Labs",
                "LANGYA AI LIMITED (Internship Program)",
                "Huawei Tech. Investment Co., Ltd (Internship Program)"
            ],
            "skills": ["PyTorch", "Digital Signal Processing", "Computer Vision"],
            "recommendedCourses": ["EE4015 / EE5410", "EE4016 / EE5438"]
        }
    ],
    "courses": [
        {
            "courseId": "EE1001",
            "titles": {
                "en": "Foundations of Digital Techniques",
                "zh": "數碼技術基礎"
            },
            "descriptions": {
                "en": "Introduces number systems, Boolean algebra, logic gates and basic digital circuits.",
                "zh": "介紹數字系統、布爾代數、邏輯閘及基本數碼電路。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.1,
            "sampleMeanGpa": 3.05,
            "category": "core",
            "hasLab": true,
            "comparator": {
                "expectedStudyHoursPerWeek": 8,
                "assessmentLoad": "High",
                "difficulty": 4,
                "gradingComponents": {
                    "assignments": 30,
                    "midterm": 20,
                    "final": 50
                },
                "scheduledMeetingTimes": [
                    {
                        "type": "Class",
                        "time": "12:00 pm - 3:00 pm",
                        "days": ["W"],
                        "location": "Li Dak Sum Yip Yio Chin A Bldg 4307"
                    },
                    {
                        "type": "Class",
                        "time": "12:00 pm - 3:00 pm",
                        "days": ["T"],
                        "location": "Yeung Kin Man Acad Building P4701"
                    }
                ]
            }
        },
        {
            "courseId": "EE1002",
            "titles": {
                "en": "Principles of Electrical Engineering",
                "zh": "電機工程原理"
            },
            "descriptions": {
                "en": "Covers fundamental electrical concepts: voltage, current, resistance, power and basic circuit laws.",
                "zh": "涵蓋基本電學概念：電壓、電流、電阻、功率及基本電路定律。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.3,
            "sampleMeanGpa": 2.95,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE1004",
            "titles": {
                "en": "Foundations of Information Systems and Data Analysis",
                "zh": "資訊系統及數據分析基礎"
            },
            "descriptions": {
                "en": "Introduces basic data handling, information systems and simple data analysis techniques.",
                "zh": "介紹基本數據處理、資訊系統及簡單數據分析技術。"
            },
            "creditUnits": 3,
            "sampleWorkload": 2.8,
            "sampleMeanGpa": 3.15,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "GE1354",
            "titles": {
                "en": "Introduction to Electronic Design",
                "zh": "電子設計導論"
            },
            "descriptions": {
                "en": "Hands-on introduction to electronic design principles and simple circuit building.",
                "zh": "透過實踐介紹電子設計原理及簡單電路製作。"
            },
            "creditUnits": 3,
            "sampleWorkload": 2.9,
            "sampleMeanGpa": 3.2,
            "category": "core",
            "hasLab": null
        },
        {
            "courseId": "EE2000",
            "titles": {
                "en": "Logic Circuit Design",
                "zh": "邏輯電路設計"
            },
            "descriptions": {
                "en": "Design of combinational and sequential logic circuits using modern digital techniques.",
                "zh": "使用現代數碼技術設計組合及時序邏輯電路。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.4,
            "sampleMeanGpa": 2.88,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE2004",
            "titles": {
                "en": "Microcomputer Systems",
                "zh": "微電腦系統"
            },
            "descriptions": {
                "en": "Fundamentals of microcomputer architecture, assembly language and interfacing.",
                "zh": "微電腦架構、組合語言及介面的基礎知識。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.5,
            "sampleMeanGpa": 2.75,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE2005",
            "titles": {
                "en": "Electronic Devices and Circuits",
                "zh": "電子器件及電路"
            },
            "descriptions": {
                "en": "Study of diodes, transistors and basic analogue electronic circuits.",
                "zh": "研習二極體、電晶體及基本模擬電子電路。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.6,
            "sampleMeanGpa": 2.7,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE2066",
            "titles": {
                "en": "Engineers in Society",
                "zh": "工程師與社會"
            },
            "descriptions": {
                "en": "Explores the role of engineers in society, ethics, sustainability and professional practice.",
                "zh": "探討工程師在社會中的角色、倫理、可持續發展及專業實踐。"
            },
            "creditUnits": 3,
            "sampleWorkload": 2.4,
            "sampleMeanGpa": 3.4,
            "category": "core",
            "hasLab": false
        },
        {
            "courseId": "EE2104",
            "titles": {
                "en": "Introduction to Electromagnetics",
                "zh": "電磁學導論"
            },
            "descriptions": {
                "en": "Basic concepts of electric and magnetic fields and their applications in engineering.",
                "zh": "電場及磁場的基本概念及其在工程上的應用。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.7,
            "sampleMeanGpa": 2.65,
            "category": "core",
            "hasLab": false
        },
        {
            "courseId": "EE2108",
            "titles": {
                "en": "Computational Engineering Analysis",
                "zh": "計算工程分析"
            },
            "descriptions": {
                "en": "Uses computational tools to analyse engineering problems and data.",
                "zh": "使用計算工具分析工程問題及數據。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.2,
            "sampleMeanGpa": 3,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE3008",
            "titles": {
                "en": "Principles of Communications",
                "zh": "通訊原理"
            },
            "descriptions": {
                "en": "Fundamentals of analogue and digital communication systems.",
                "zh": "模擬及數碼通訊系統的基本原理。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.5,
            "sampleMeanGpa": 2.8,
            "category": "core",
            "hasLab": false
        },
        {
            "courseId": "EE3070",
            "titles": {
                "en": "Design Project",
                "zh": "設計專題"
            },
            "descriptions": {
                "en": "Team-based design project solving real engineering problems.",
                "zh": "以小組形式進行設計專題，解決實際工程問題。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.8,
            "sampleMeanGpa": 3.1,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE3109",
            "titles": {
                "en": "Applied Electromagnetics",
                "zh": "應用電磁學"
            },
            "descriptions": {
                "en": "Advanced applications of electromagnetic theory in engineering systems.",
                "zh": "電磁理論在工程系統中的進階應用。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.9,
            "sampleMeanGpa": 2.6,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE3114",
            "titles": {
                "en": "Systems & Control",
                "zh": "系統與控制"
            },
            "descriptions": {
                "en": "Modelling and control of dynamic systems, feedback and stability.",
                "zh": "動態系統的建模與控制、反饋及穩定性。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.6,
            "sampleMeanGpa": 2.85,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE3115",
            "titles": {
                "en": "Applied Optoelectronic Devices",
                "zh": "應用光電子器件"
            },
            "descriptions": {
                "en": "Principles and applications of optoelectronic devices (LEDs, lasers, photodetectors).",
                "zh": "光電子器件（LED、激光、光探測器）的原理及應用。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.3,
            "sampleMeanGpa": 2.95,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE3121",
            "titles": {
                "en": "Differential Equations for Electrical Engineering",
                "zh": "電機工程微分方程"
            },
            "descriptions": {
                "en": "Mathematical methods for solving differential equations in EE problems.",
                "zh": "解決電機工程問題中微分方程的數學方法。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.4,
            "sampleMeanGpa": 2.9,
            "category": "core",
            "hasLab": false
        },
        {
            "courseId": "EE3122",
            "titles": {
                "en": "Analogue Circuit Fundamentals",
                "zh": "模擬電路基礎"
            },
            "descriptions": {
                "en": "Design and analysis of analogue circuits including amplifiers and filters.",
                "zh": "模擬電路（包括放大器及濾波器）的設計與分析。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.7,
            "sampleMeanGpa": 2.7,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE3123",
            "titles": {
                "en": "Introduction to Electric Power Systems",
                "zh": "電力系統導論"
            },
            "descriptions": {
                "en": "Basics of power generation, transmission, distribution and power system components.",
                "zh": "發電、輸電、配電及電力系統元件的基礎知識。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.2,
            "sampleMeanGpa": 3.05,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE3124",
            "titles": {
                "en": "Introduction to Electric Machines and Drives",
                "zh": "電機及驅動導論"
            },
            "descriptions": {
                "en": "Principles of electric machines (motors & generators) and drive systems.",
                "zh": "電機（馬達及發電機）及驅動系統的原理。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.3,
            "sampleMeanGpa": 2.98,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "EE3210",
            "titles": {
                "en": "Signals and Systems",
                "zh": "信號與系統"
            },
            "descriptions": {
                "en": "Analysis of continuous and discrete-time signals and linear systems.",
                "zh": "連續及離散時間信號與線性系統的分析。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.8,
            "sampleMeanGpa": 2.55,
            "category": "core",
            "hasLab": false
        },
        {
            "courseId": "EE4080",
            "titles": {
                "en": "Project",
                "zh": "專題研究"
            },
            "descriptions": {
                "en": "Final Year Project – independent research or design work under supervision.",
                "zh": "畢業專題 – 在指導下進行獨立研究或設計工作。"
            },
            "creditUnits": 6,
            "sampleWorkload": 4.2,
            "sampleMeanGpa": 3.25,
            "category": "core",
            "hasLab": null
        },
        {
            "courseId": "EE4090",
            "titles": {
                "en": "Engineering Training",
                "zh": "工程訓練"
            },
            "descriptions": {
                "en": "Practical engineering training (can be fulfilled by internship).",
                "zh": "實務工程訓練（可由實習取代）。"
            },
            "creditUnits": 0,
            "sampleWorkload": 2,
            "sampleMeanGpa": 3.5,
            "category": "core",
            "hasLab": true
        },
        {
            "courseId": "CS2311",
            "titles": {
                "en": "Computer Programming",
                "zh": "電腦程式設計"
            },
            "descriptions": {
                "en": "Programming fundamentals for engineering applications.",
                "zh": "工程應用的程式設計基礎。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3,
            "sampleMeanGpa": 3.1,
            "category": "core",
            "hasLab": null
        },
        {
            "courseId": "MA2001",
            "titles": {
                "en": "Multi-variable Calculus and Linear Algebra",
                "zh": "多變量微積分及線性代數"
            },
            "descriptions": {
                "en": "Advanced mathematics needed for engineering analysis.",
                "zh": "工程分析所需的高等數學。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.5,
            "sampleMeanGpa": 2.8,
            "category": "core",
            "hasLab": null
        },
        {
            "courseId": "EE2331",
            "titles": {
                "en": "Data Structures and Algorithms",
                "zh": "數據結構與算法"
            },
            "descriptions": {
                "en": "Common data structures and algorithms used in engineering software.",
                "zh": "工程軟件常用的數據結構與算法。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.4,
            "sampleMeanGpa": 2.9,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE2800",
            "titles": {
                "en": "Semiconductor Physics for Engineers",
                "zh": "工程師半導體物理"
            },
            "descriptions": {
                "en": "Physics of semiconductor materials and devices.",
                "zh": "半導體材料及器件的物理學。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.6,
            "sampleMeanGpa": 2.75,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE3009",
            "titles": {
                "en": "Data Communications and Networking",
                "zh": "數據通訊與網絡"
            },
            "descriptions": {
                "en": "Principles of computer networks and data communication protocols.",
                "zh": "電腦網絡及數據通訊協議的原理。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.2,
            "sampleMeanGpa": 3,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE3206",
            "titles": {
                "en": "Object-Oriented Programming and Applications",
                "zh": "物件導向程式設計及應用"
            },
            "descriptions": {
                "en": "Object-oriented programming concepts and practical applications.",
                "zh": "物件導向程式設計概念及實際應用。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.1,
            "sampleMeanGpa": 3.15,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE3220",
            "titles": {
                "en": "System-on-Chip Design",
                "zh": "系統單晶片設計"
            },
            "descriptions": {
                "en": "Design of complex digital systems on a single chip (SoC).",
                "zh": "在單一晶片上設計複雜數碼系統（SoC）。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.8,
            "sampleMeanGpa": 2.7,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE4015 / EE5410",
            "titles": {
                "en": "Digital Signal Processing",
                "zh": "數碼信號處理"
            },
            "descriptions": {
                "en": "Techniques for processing digital signals (filtering, FFT, etc.).",
                "zh": "處理數碼信號的技術（濾波、FFT等）。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.7,
            "sampleMeanGpa": 2.65,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4016 / EE5438",
            "titles": {
                "en": "Applications of AI with Deep Learning",
                "zh": "深度學習人工智能應用"
            },
            "descriptions": {
                "en": "Practical applications of deep learning in engineering problems.",
                "zh": "深度學習在工程問題上的實際應用。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.5,
            "sampleMeanGpa": 3.05,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4017",
            "titles": {
                "en": "Internet Finance",
                "zh": "互聯網金融"
            },
            "descriptions": {
                "en": "Technology and systems behind fintech and internet finance.",
                "zh": "金融科技及互聯網金融背後的技術與系統。"
            },
            "creditUnits": 3,
            "sampleWorkload": 2.7,
            "sampleMeanGpa": 3.3,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE4035",
            "titles": {
                "en": "Optical Fibre Communications",
                "zh": "光纖通訊"
            },
            "descriptions": {
                "en": "Principles of optical fibre communication systems.",
                "zh": "光纖通訊系統的原理。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.3,
            "sampleMeanGpa": 2.95,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE4036",
            "titles": {
                "en": "Wireless Communications",
                "zh": "無線通訊"
            },
            "descriptions": {
                "en": "Modern wireless communication technologies and systems.",
                "zh": "現代無線通訊技術及系統。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.4,
            "sampleMeanGpa": 2.85,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4045",
            "titles": {
                "en": "Computer Controlled Systems",
                "zh": "電腦控制系統"
            },
            "descriptions": {
                "en": "Design of computer-based control systems.",
                "zh": "基於電腦的控制系統設計。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.5,
            "sampleMeanGpa": 2.9,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4101",
            "titles": {
                "en": "Sustainable Energy Systems",
                "zh": "可持續能源系統"
            },
            "descriptions": {
                "en": "Renewable energy systems and sustainable power technologies.",
                "zh": "可再生能源系統及可持續電力技術。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3,
            "sampleMeanGpa": 3.2,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4105",
            "titles": {
                "en": "Principles of Lasers",
                "zh": "激光原理"
            },
            "descriptions": {
                "en": "Working principles and applications of lasers.",
                "zh": "激光的工作原理及應用。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.2,
            "sampleMeanGpa": 3,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE4107",
            "titles": {
                "en": "5G Circuit Design",
                "zh": "5G電路設計"
            },
            "descriptions": {
                "en": "Circuit design techniques for 5G wireless systems.",
                "zh": "5G無線系統的電路設計技術。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.6,
            "sampleMeanGpa": 2.8,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE4108",
            "titles": {
                "en": "Antennas for Wireless Communications and Sensing",
                "zh": "無線通訊及感測天線"
            },
            "descriptions": {
                "en": "Antenna design for wireless communication and sensing applications.",
                "zh": "無線通訊及感測應用的天線設計。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.5,
            "sampleMeanGpa": 2.85,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4115",
            "titles": {
                "en": "Audio-Visual Engineering",
                "zh": "影音工程"
            },
            "descriptions": {
                "en": "Engineering principles of audio and video systems.",
                "zh": "音頻及視頻系統的工程原理。"
            },
            "creditUnits": 3,
            "sampleWorkload": 2.9,
            "sampleMeanGpa": 3.15,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4142",
            "titles": {
                "en": "Introduction to Integrated Photonics",
                "zh": "集成光子學導論"
            },
            "descriptions": {
                "en": "Basics of photonic integrated circuits.",
                "zh": "光子集成電路的基礎知識。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.4,
            "sampleMeanGpa": 2.9,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE4146",
            "titles": {
                "en": "Data Engineering and Machine Learning",
                "zh": "數據工程及機器學習"
            },
            "descriptions": {
                "en": "Data processing pipelines and machine learning applications.",
                "zh": "數據處理流程及機器學習應用。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.3,
            "sampleMeanGpa": 3.05,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4147",
            "titles": {
                "en": "Grid-Connected Power Converters",
                "zh": "併網電力轉換器"
            },
            "descriptions": {
                "en": "Power electronic converters used in grid-connected systems.",
                "zh": "用於併網系統的電力電子轉換器。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.5,
            "sampleMeanGpa": 2.88,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4148",
            "titles": {
                "en": "Advanced Power System",
                "zh": "進階電力系統"
            },
            "descriptions": {
                "en": "Advanced topics in electric power systems analysis and operation.",
                "zh": "電力系統分析及運作的進階主題。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.6,
            "sampleMeanGpa": 2.75,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE4149",
            "titles": {
                "en": "Power Electronics",
                "zh": "電力電子學"
            },
            "descriptions": {
                "en": "Design and control of power electronic converters.",
                "zh": "電力電子轉換器的設計與控制。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.7,
            "sampleMeanGpa": 2.7,
            "category": "elective",
            "hasLab": true
        },
        {
            "courseId": "EE4221",
            "titles": {
                "en": "Cloud Computing Systems",
                "zh": "雲端運算系統"
            },
            "descriptions": {
                "en": "Architecture and technologies of cloud computing systems.",
                "zh": "雲端運算系統的架構及技術。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.1,
            "sampleMeanGpa": 3.1,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "EE4316",
            "titles": {
                "en": "Mobile Data Networks",
                "zh": "流動數據網絡"
            },
            "descriptions": {
                "en": "Technologies and protocols used in mobile data networks.",
                "zh": "流動數據網絡使用的技術及協議。"
            },
            "creditUnits": 3,
            "sampleWorkload": 3.2,
            "sampleMeanGpa": 3,
            "category": "elective",
            "hasLab": false
        },
        {
            "courseId": "GE1401",
            "titles": {
                "en": "University English"
            },
            "creditUnits": 3,
            "category": "general-education",
            "hasLab": null
        },
        {
            "courseId": "GE2410",
            "titles": {
                "en": "English for Engineering"
            },
            "creditUnits": 3,
            "category": "general-education",
            "hasLab": null
        },
        {
            "courseId": "GE1501",
            "titles": {
                "en": "Chinese Civilisation"
            },
            "creditUnits": 3,
            "category": "general-education",
            "hasLab": null
        },
        {
            "courseId": "GE_AREA1",
            "titles": {
                "en": "GE Area 1 - Arts & Humanities"
            },
            "creditUnits": 3,
            "category": "general-education",
            "hasLab": null
        },
        {
            "courseId": "GE_AREA2",
            "titles": {
                "en": "GE Area 2 - Study of Societies"
            },
            "creditUnits": 3,
            "category": "general-education",
            "hasLab": null
        },
        {
            "courseId": "GE_AREA3",
            "titles": {
                "en": "GE Area 3 - Science & Technology"
            },
            "creditUnits": 3,
            "category": "general-education",
            "hasLab": null
        },
        {
            "courseId": "GE_RANDOM",
            "titles": {
                "en": "GE Area (Distributional)"
            },
            "creditUnits": 3,
            "category": "general-education",
            "hasLab": null
        },
        {
            "courseId": "MA1200",
            "titles": {
                "en": "Calculus I"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "MA1201",
            "titles": {
                "en": "Calculus II"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "CS1302",
            "titles": {
                "en": "Intro to Computer Programming"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "PHY1101",
            "titles": {
                "en": "Intro Classical Mechanics"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "EE3001",
            "titles": {
                "en": "Foundations of Data Eng"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": false
        },
        {
            "courseId": "EE3211",
            "titles": {
                "en": "Modelling Techniques"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": false
        },
        {
            "courseId": "CS3103",
            "titles": {
                "en": "Operating Systems"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "EE3315",
            "titles": {
                "en": "Internet Technology"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": true
        },
        {
            "courseId": "CS3402",
            "titles": {
                "en": "Database Systems"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "EE4080 A",
            "titles": {
                "en": "Final Year Project (Part A)"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "EE4080 B",
            "titles": {
                "en": "Final Year Project (Part B)"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "TE_ELEC1",
            "titles": {
                "en": "Technical Elective 1"
            },
            "creditUnits": 3,
            "category": "technical-elective",
            "hasLab": null
        },
        {
            "courseId": "TE_ELEC2",
            "titles": {
                "en": "Technical Elective 2"
            },
            "creditUnits": 3,
            "category": "technical-elective",
            "hasLab": null
        },
        {
            "courseId": "TE_ELEC3",
            "titles": {
                "en": "Technical Elective 3"
            },
            "creditUnits": 3,
            "category": "technical-elective",
            "hasLab": null
        },
        {
            "courseId": "TE_ELEC4",
            "titles": {
                "en": "Technical Elective 4"
            },
            "creditUnits": 3,
            "category": "technical-elective",
            "hasLab": null
        },
        {
            "courseId": "TE_ELEC5",
            "titles": {
                "en": "Technical Elective 5"
            },
            "creditUnits": 3,
            "category": "technical-elective",
            "hasLab": null
        },
        {
            "courseId": "EE2302",
            "titles": {
                "en": "Foundations Info Eng & Crypto"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": false
        },
        {
            "courseId": "EE3331",
            "titles": {
                "en": "Probability Models INFE"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "EE2303",
            "titles": {
                "en": "Applied AI Systems INFE"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": false
        },
        {
            "courseId": "EE3301",
            "titles": {
                "en": "Quantitative Methods INFE"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": false
        },
        {
            "courseId": "EE3800",
            "titles": {
                "en": "Semiconductor Materials"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": true
        },
        {
            "courseId": "EE3801",
            "titles": {
                "en": "Microsystems & Nanotech"
            },
            "creditUnits": 3,
            "category": "curriculum",
            "hasLab": null
        },
        {
            "courseId": "EE2002",
            "titles": {
                "en": "Circuit Theory"
            },
            "category": "comparator-sample",
            "hasLab": null,
            "comparator": {
                "expectedStudyHoursPerWeek": 10,
                "assessmentLoad": "High",
                "difficulty": 5,
                "gradingComponents": {
                    "assignments": 25,
                    "midterm": 25,
                    "final": 50
                },
                "scheduledMeetingTimes": [
                    {
                        "type": "Class",
                        "time": "9:00 am - 12:00 pm",
                        "days": ["M"],
                        "location": "Academic 1 2001"
                    },
                    {
                        "type": "Tutorial",
                        "time": "1:00 pm - 2:00 pm",
                        "days": ["F"],
                        "location": "Academic 1 2512"
                    }
                ]
            }
        },
        {
            "courseId": "EE3101",
            "titles": {
                "en": "Signals and Systems"
            },
            "category": "comparator-sample",
            "hasLab": null,
            "comparator": {
                "expectedStudyHoursPerWeek": 12,
                "assessmentLoad": "Very High",
                "difficulty": 5,
                "gradingComponents": {
                    "assignments": 20,
                    "midterm": 30,
                    "final": 50
                },
                "scheduledMeetingTimes": [
                    {
                        "type": "Class",
                        "time": "9:00 am - 12:00 pm",
                        "days": ["T"],
                        "location": "YEUNG Kin Man Building P4704"
                    },
                    {
                        "type": "Lab",
                        "time": "3:00 pm - 6:00 pm",
                        "days": ["Th"],
                        "location": "EEE Laboratory 3"
                    }
                ]
            }
        },
        {
            "courseId": "EE3201",
            "titles": {
                "en": "Electromagnetic Fields"
            },
            "category": "comparator-sample",
            "hasLab": null,
            "comparator": {
                "expectedStudyHoursPerWeek": 9,
                "assessmentLoad": "Moderate",
                "difficulty": 4,
                "gradingComponents": {
                    "assignments": 35,
                    "midterm": 15,
                    "final": 50
                },
                "scheduledMeetingTimes": [
                    {
                        "type": "Class",
                        "time": "3:00 pm - 6:00 pm",
                        "days": ["W"],
                        "location": "CSE Labs 1"
                    },
                    {
                        "type": "Tutorial",
                        "time": "11:00 am - 12:00 pm",
                        "days": ["F"],
                        "location": "Academic 2 3030"
                    }
                ]
            }
        },
        {
            "courseId": "EE4213",
            "titles": {
                "en": "Programming for Engineers"
            },
            "category": "comparator-sample",
            "hasLab": false,
            "comparator": {
                "expectedStudyHoursPerWeek": 11,
                "assessmentLoad": "High",
                "difficulty": 4,
                "gradingComponents": {
                    "assignments": 40,
                    "midterm": 20,
                    "final": 40
                },
                "scheduledMeetingTimes": [
                    {
                        "type": "Class",
                        "time": "12:00 pm - 3:00 pm",
                        "days": ["T"],
                        "location": "YEUNG Kin Man Building P4701"
                    },
                    {
                        "type": "Lab",
                        "time": "3:00 pm - 6:00 pm",
                        "days": ["Th"],
                        "location": "Innovation Hub 3104"
                    }
                ]
            }
        },
        {
            "courseId": "EE4301",
            "titles": {
                "en": "Power Electronics"
            },
            "category": "comparator-sample",
            "hasLab": null,
            "comparator": {
                "expectedStudyHoursPerWeek": 14,
                "assessmentLoad": "Very High",
                "difficulty": 5,
                "gradingComponents": {
                    "assignments": 25,
                    "midterm": 25,
                    "final": 50
                },
                "scheduledMeetingTimes": [
                    {
                        "type": "Class",
                        "time": "9:00 am - 12:00 pm",
                        "days": ["M"],
                        "location": "Energy Centre 3402"
                    },
                    {
                        "type": "Lab",
                        "time": "12:00 pm - 3:00 pm",
                        "days": ["F"],
                        "location": "Energy Centre 3405"
                    }
                ]
            }
        },
        {
            "courseId": "EE2201",
            "titles": {
                "en": "Electronic Devices and Circuits"
            },
            "category": "comparator-sample",
            "hasLab": null,
            "comparator": {
                "expectedStudyHoursPerWeek": 10,
                "assessmentLoad": "High",
                "difficulty": 4,
                "gradingComponents": {
                    "assignments": 30,
                    "midterm": 20,
                    "final": 50
                },
                "scheduledMeetingTimes": [
                    {
                        "type": "Class",
                        "time": "9:00 am - 12:00 pm",
                        "days": ["W"],
                        "location": "YEUNG Kin Man Building P4701"
                    },
                    {
                        "type": "Tutorial",
                        "time": "2:00 pm - 3:00 pm",
                        "days": ["F"],
                        "location": "Academic 2 3505"
                    }
                ]
            }
        },
        {
            "courseId": "EE3302",
            "titles": {
                "en": "Control Systems"
            },
            "category": "comparator-sample",
            "hasLab": null,
            "comparator": {
                "expectedStudyHoursPerWeek": 11,
                "assessmentLoad": "High",
                "difficulty": 4,
                "gradingComponents": {
                    "assignments": 25,
                    "midterm": 25,
                    "final": 50
                },
                "scheduledMeetingTimes": [
                    {
                        "type": "Class",
                        "time": "9:00 am - 12:00 pm",
                        "days": ["M"],
                        "location": "Academic 1 2102"
                    },
                    {
                        "type": "Tutorial",
                        "time": "3:00 pm - 4:00 pm",
                        "days": ["W"],
                        "location": "YEUNG Kin Man Building P4704"
                    }
                ]
            }
        },
        {
            "courseId": "EE4402",
            "titles": {
                "en": "Renewable Energy Systems"
            },
            "category": "comparator-sample",
            "hasLab": null,
            "comparator": {
                "expectedStudyHoursPerWeek": 10,
                "assessmentLoad": "Moderate",
                "difficulty": 3,
                "gradingComponents": {
                    "assignments": 35,
                    "project": 25,
                    "final": 40
                },
                "scheduledMeetingTimes": [
                    {
                        "type": "Class",
                        "time": "3:00 pm - 6:00 pm",
                        "days": ["Th"],
                        "location": "Energy Centre 3402"
                    },
                    {
                        "type": "Project",
                        "time": "9:00 am - 12:00 pm",
                        "days": ["F"],
                        "location": "Energy Centre 3405"
                    }
                ]
            }
        }
    ],
    "comparatorSemesterPresets": {
        "2A": [
            "EE1001",
            "EE2002",
            "EE2201"
        ],
        "2B": [
            "EE1001",
            "EE2201",
            "EE3201",
            "EE3302"
        ],
        "3A": [
            "EE2002",
            "EE3101",
            "EE3201",
            "EE3302"
        ],
        "3B": [
            "EE3101",
            "EE3302",
            "EE4213",
            "EE4301"
        ],
        "4A": [
            "EE3101",
            "EE4213",
            "EE4301",
            "EE4402"
        ],
        "4B": [
            "EE3201",
            "EE4213",
            "EE4301",
            "EE4402"
        ]
    },
    "majors": [
        {
            "majorId": "CDE",
            "name": {
                "en": "Computer and Data Engineering"
            },
            "curriculum": [
                {
                    "courseId": "GE1401",
                    "curriculumTitle": "University English",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE2410",
                    "curriculumTitle": "English for Engineering",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE1501",
                    "curriculumTitle": "Chinese Civilisation",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Fri",
                    "timeSlot": "12:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA1",
                    "curriculumTitle": "GE Area 1 - Arts & Humanities",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Tue",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA2",
                    "curriculumTitle": "GE Area 2 - Study of Societies",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Thu",
                    "timeSlot": "12:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA3",
                    "curriculumTitle": "GE Area 3 - Science & Technology",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Mon",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_RANDOM",
                    "curriculumTitle": "GE Area (Distributional)",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Wed",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "MA1200",
                    "curriculumTitle": "Calculus I",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Mon",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "MA1201",
                    "curriculumTitle": "Calculus II",
                    "creditUnits": 3,
                    "semester": "1B",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA1200"
                    ]
                },
                {
                    "courseId": "GE1354",
                    "curriculumTitle": "Intro to Electronic Design",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Fri",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "CS1302",
                    "curriculumTitle": "Intro to Computer Programming",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Thu",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE1001",
                    "curriculumTitle": "Foundations of Digital Tech",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Mon",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE1002",
                    "curriculumTitle": "Principles of Electrical Eng",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Tue",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE1004",
                    "curriculumTitle": "Foundations of Info Systems",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Wed",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "PHY1101",
                    "curriculumTitle": "Intro Classical Mechanics",
                    "creditUnits": 3,
                    "semester": "1B",
                    "day": "Fri",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "MA2001",
                    "curriculumTitle": "Multi-variable Calculus",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA1201"
                    ]
                },
                {
                    "courseId": "EE3001",
                    "curriculumTitle": "Foundations of Data Eng",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Tue",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE1004"
                    ],
                    "blocksCourseId": "EE3211",
                    "downstreamCourseId": "EE4146"
                },
                {
                    "courseId": "CS2311",
                    "curriculumTitle": "Computer Programming",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "CS1302"
                    ],
                    "blocksCourseId": "EE2331",
                    "downstreamCourseId": "CS3103"
                },
                {
                    "courseId": "EE2000",
                    "curriculumTitle": "Logic Circuit Design",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Mon",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE1001"
                    ],
                    "blocksCourseId": "EE2004",
                    "downstreamCourseId": "EE3220"
                },
                {
                    "courseId": "EE2005",
                    "curriculumTitle": "Electronic Devices & Circuits",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Thu",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE1002"
                    ]
                },
                {
                    "courseId": "EE3211",
                    "curriculumTitle": "Modelling Techniques",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Fri",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE3001"
                    ]
                },
                {
                    "courseId": "EE2331",
                    "curriculumTitle": "Data Structures & Algorithms",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Tue",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "CS2311"
                    ]
                },
                {
                    "courseId": "EE2004",
                    "curriculumTitle": "Microcomputer Systems",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Thu",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE2000"
                    ]
                },
                {
                    "courseId": "EE3009",
                    "curriculumTitle": "Data Comms & Networking",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Thu",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE3210",
                    "curriculumTitle": "Signals and Systems",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Tue",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA2001"
                    ]
                },
                {
                    "courseId": "EE3206",
                    "curriculumTitle": "Java Programming & Apps",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Wed",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "CS3103",
                    "curriculumTitle": "Operating Systems",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Fri",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE2004"
                    ]
                },
                {
                    "courseId": "EE3070",
                    "curriculumTitle": "Design Project",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Mon",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE3315",
                    "curriculumTitle": "Internet Technology",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Mon",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE3009"
                    ]
                },
                {
                    "courseId": "EE4090",
                    "curriculumTitle": "Engineering Training",
                    "creditUnits": 0,
                    "semester": "3A",
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE4146",
                    "curriculumTitle": "Data Eng & Learning Systems",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE3211"
                    ]
                },
                {
                    "courseId": "CS3402",
                    "curriculumTitle": "Database Systems",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Tue",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE3220",
                    "curriculumTitle": "System-On-Chip Design",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Fri",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE2004"
                    ]
                },
                {
                    "courseId": "EE4080 A",
                    "curriculumTitle": "Final Year Project (Part A)",
                    "creditUnits": 3,
                    "semester": "4A",
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE4080 B",
                    "curriculumTitle": "Final Year Project (Part B)",
                    "creditUnits": 3,
                    "semester": "4B",
                    "prerequisiteCourseIds": [
                        "EE4080 A"
                    ],
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE2066",
                    "curriculumTitle": "Engineers in Society",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Thu",
                    "timeSlot": "15:00"
                },
                {
                    "courseId": "TE_ELEC1",
                    "curriculumTitle": "Technical Elective 1",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Mon",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC2",
                    "curriculumTitle": "Technical Elective 2",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Tue",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC3",
                    "curriculumTitle": "Technical Elective 3",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Wed",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC4",
                    "curriculumTitle": "Technical Elective 4",
                    "creditUnits": 3,
                    "semester": "4B",
                    "day": "Thu",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC5",
                    "curriculumTitle": "Technical Elective 5",
                    "creditUnits": 3,
                    "semester": "4B",
                    "day": "Fri",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                }
            ]
        },
        {
            "majorId": "INFE",
            "name": {
                "en": "Information Engineering"
            },
            "curriculum": [
                {
                    "courseId": "GE1401",
                    "curriculumTitle": "University English",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE2410",
                    "curriculumTitle": "English for Engineering",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE1501",
                    "curriculumTitle": "Chinese Civilisation",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Fri",
                    "timeSlot": "12:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA1",
                    "curriculumTitle": "GE Area 1 - Arts & Humanities",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Tue",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA2",
                    "curriculumTitle": "GE Area 2 - Study of Societies",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Thu",
                    "timeSlot": "12:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA3",
                    "curriculumTitle": "GE Area 3 - Science & Technology",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Mon",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_RANDOM",
                    "curriculumTitle": "GE Area (Distributional)",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Wed",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "MA1200",
                    "curriculumTitle": "Calculus I",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Mon",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "MA1201",
                    "curriculumTitle": "Calculus II",
                    "creditUnits": 3,
                    "semester": "1B",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA1200"
                    ]
                },
                {
                    "courseId": "PHY1101",
                    "curriculumTitle": "Intro Classical Mechanics",
                    "creditUnits": 3,
                    "semester": "1B",
                    "day": "Fri",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE1001",
                    "curriculumTitle": "Foundations Digital Tech",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Mon",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "CS1302",
                    "curriculumTitle": "Intro Computer Programming",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Thu",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "GE1354",
                    "curriculumTitle": "Intro Electronic Design",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Fri",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE1004",
                    "curriculumTitle": "Foundations Info Systems",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Wed",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE1002",
                    "curriculumTitle": "Principles Electrical Eng",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Tue",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "MA2001",
                    "curriculumTitle": "Multi-variable Calculus",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA1201"
                    ]
                },
                {
                    "courseId": "EE2302",
                    "curriculumTitle": "Foundations Info Eng & Crypto",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Tue",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE1001"
                    ],
                    "blocksCourseId": "EE3301",
                    "downstreamCourseId": "EE3008"
                },
                {
                    "courseId": "EE3331",
                    "curriculumTitle": "Probability Models INFE",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Wed",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE3009",
                    "curriculumTitle": "Data Comms & Networking",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Tue",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "CS2311",
                    "curriculumTitle": "Computer Programming",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Mon",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "CS1302"
                    ]
                },
                {
                    "courseId": "EE2303",
                    "curriculumTitle": "Applied AI Systems INFE",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Fri",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE2000",
                    "curriculumTitle": "Logic Circuit Design",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Tue",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE1001"
                    ]
                },
                {
                    "courseId": "EE2004",
                    "curriculumTitle": "Microcomputer Systems",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Thu",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE2000"
                    ]
                },
                {
                    "courseId": "EE3210",
                    "curriculumTitle": "Signals and Systems",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Thu",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA2001"
                    ]
                },
                {
                    "courseId": "EE3301",
                    "curriculumTitle": "Quantitative Methods INFE",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Wed",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE2302"
                    ]
                },
                {
                    "courseId": "CS3402",
                    "curriculumTitle": "Database Systems",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Fri",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE2331",
                    "curriculumTitle": "Data Structures & Algo",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "CS2311"
                    ]
                },
                {
                    "courseId": "EE3070",
                    "curriculumTitle": "Design Project",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Thu",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE4090",
                    "curriculumTitle": "Engineering Training",
                    "creditUnits": 0,
                    "semester": "3A",
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE3008",
                    "curriculumTitle": "Principles of Comms",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE3301"
                    ]
                },
                {
                    "courseId": "EE3315",
                    "curriculumTitle": "Internet Technology",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Tue",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE3009"
                    ]
                },
                {
                    "courseId": "EE3206",
                    "curriculumTitle": "Object-Oriented Prog",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Fri",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "CS3103",
                    "curriculumTitle": "Operating Systems",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Mon",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE2004"
                    ]
                },
                {
                    "courseId": "EE4080 A",
                    "curriculumTitle": "Final Year Project (Part A)",
                    "creditUnits": 3,
                    "semester": "4A",
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE4080 B",
                    "curriculumTitle": "Final Year Project (Part B)",
                    "creditUnits": 3,
                    "semester": "4B",
                    "prerequisiteCourseIds": [
                        "EE4080 A"
                    ],
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE2066",
                    "curriculumTitle": "Engineers in Society",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Thu",
                    "timeSlot": "15:00"
                },
                {
                    "courseId": "TE_ELEC1",
                    "curriculumTitle": "Technical Elective 1",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Mon",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC2",
                    "curriculumTitle": "Technical Elective 2",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Tue",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC3",
                    "curriculumTitle": "Technical Elective 3",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Wed",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC4",
                    "curriculumTitle": "Technical Elective 4",
                    "creditUnits": 3,
                    "semester": "4B",
                    "day": "Thu",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC5",
                    "curriculumTitle": "Technical Elective 5",
                    "creditUnits": 3,
                    "semester": "4B",
                    "day": "Fri",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                }
            ]
        },
        {
            "majorId": "ELEL",
            "name": {
                "en": "Electronic and Electrical Engineering"
            },
            "curriculum": [
                {
                    "courseId": "GE1401",
                    "curriculumTitle": "University English",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE2410",
                    "curriculumTitle": "English for Engineering",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE1501",
                    "curriculumTitle": "Chinese Civilisation",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Fri",
                    "timeSlot": "12:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA1",
                    "curriculumTitle": "GE Area 1 - Arts & Humanities",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Tue",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA2",
                    "curriculumTitle": "GE Area 2 - Study of Societies",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Thu",
                    "timeSlot": "12:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA3",
                    "curriculumTitle": "GE Area 3 - Science & Technology",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Mon",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_RANDOM",
                    "curriculumTitle": "GE Area (Distributional)",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Wed",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "MA1200",
                    "curriculumTitle": "Calculus I",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Mon",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "MA1201",
                    "curriculumTitle": "Calculus II",
                    "creditUnits": 3,
                    "semester": "1B",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA1200"
                    ]
                },
                {
                    "courseId": "EE1001",
                    "curriculumTitle": "Foundations Digital Tech",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Mon",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE1002",
                    "curriculumTitle": "Principles Electrical Eng",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Tue",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE1004",
                    "curriculumTitle": "Foundations Info Systems",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Wed",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "GE1354",
                    "curriculumTitle": "Intro Electronic Design",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Fri",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "PHY1101",
                    "curriculumTitle": "Intro Classical Mechanics",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Fri",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "CS1302",
                    "curriculumTitle": "Intro Computer Programming",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Thu",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "MA2001",
                    "curriculumTitle": "Multi-variable Calculus",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA1201"
                    ]
                },
                {
                    "courseId": "EE2108",
                    "curriculumTitle": "Computational Eng Analysis",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Tue",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE3121",
                    "curriculumTitle": "Diff Equations for EE",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA2001"
                    ]
                },
                {
                    "courseId": "EE3210",
                    "curriculumTitle": "Signals and Systems",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Tue",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE1002"
                    ]
                },
                {
                    "courseId": "EE2104",
                    "curriculumTitle": "Intro Electromagnetics",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Fri",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA1201"
                    ],
                    "blocksCourseId": "EE3109",
                    "downstreamCourseId": "EE3114"
                },
                {
                    "courseId": "EE2005",
                    "curriculumTitle": "Electronic Devices & Circuits",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Mon",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE1002"
                    ]
                },
                {
                    "courseId": "CS2311",
                    "curriculumTitle": "Computer Programming",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Tue",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "CS1302"
                    ]
                },
                {
                    "courseId": "EE2000",
                    "curriculumTitle": "Logic Circuit Design",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Wed",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE1001"
                    ]
                },
                {
                    "courseId": "EE3114",
                    "curriculumTitle": "Systems & Control",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE2104"
                    ]
                },
                {
                    "courseId": "EE3008",
                    "curriculumTitle": "Principles of Comms",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Tue",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE3123",
                    "curriculumTitle": "Intro Electric Power Systems",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Wed",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE2004",
                    "curriculumTitle": "Microcomputer Systems",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Thu",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE2000"
                    ]
                },
                {
                    "courseId": "EE4090",
                    "curriculumTitle": "Engineering Training",
                    "creditUnits": 0,
                    "semester": "3A",
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE3109",
                    "curriculumTitle": "Applied Electromagnetics",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Fri",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE2104"
                    ]
                },
                {
                    "courseId": "EE3124",
                    "curriculumTitle": "Electric Machines & Drives",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Mon",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE3123"
                    ]
                },
                {
                    "courseId": "EE3115",
                    "curriculumTitle": "Applied Opto-Electronic",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Tue",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE3122",
                    "curriculumTitle": "Analogue Circuit Fund",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE2005"
                    ]
                },
                {
                    "courseId": "EE3070",
                    "curriculumTitle": "Design Project",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Thu",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE4080 A",
                    "curriculumTitle": "Final Year Project (Part A)",
                    "creditUnits": 3,
                    "semester": "4A",
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE4080 B",
                    "curriculumTitle": "Final Year Project (Part B)",
                    "creditUnits": 3,
                    "semester": "4B",
                    "prerequisiteCourseIds": [
                        "EE4080 A"
                    ],
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE2066",
                    "curriculumTitle": "Engineers in Society",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Thu",
                    "timeSlot": "15:00"
                },
                {
                    "courseId": "TE_ELEC1",
                    "curriculumTitle": "Technical Elective 1",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Mon",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC2",
                    "curriculumTitle": "Technical Elective 2",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Tue",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC3",
                    "curriculumTitle": "Technical Elective 3",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Wed",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC4",
                    "curriculumTitle": "Technical Elective 4",
                    "creditUnits": 3,
                    "semester": "4B",
                    "day": "Thu",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC5",
                    "curriculumTitle": "Technical Elective 5",
                    "creditUnits": 3,
                    "semester": "4B",
                    "day": "Fri",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                }
            ]
        },
        {
            "majorId": "MEE",
            "name": {
                "en": "Microelectronic Engineering"
            },
            "curriculum": [
                {
                    "courseId": "GE1401",
                    "curriculumTitle": "University English",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE2410",
                    "curriculumTitle": "English for Engineering",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE1501",
                    "curriculumTitle": "Chinese Civilisation",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Fri",
                    "timeSlot": "12:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA1",
                    "curriculumTitle": "GE Area 1 - Arts & Humanities",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Tue",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA2",
                    "curriculumTitle": "GE Area 2 - Study of Societies",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Thu",
                    "timeSlot": "12:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_AREA3",
                    "curriculumTitle": "GE Area 3 - Science & Technology",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Mon",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "GE_RANDOM",
                    "curriculumTitle": "GE Area (Distributional)",
                    "creditUnits": 3,
                    "semester": "GE",
                    "day": "Wed",
                    "timeSlot": "15:00",
                    "isGeneralEducation": true
                },
                {
                    "courseId": "MA1200",
                    "curriculumTitle": "Calculus I",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Mon",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "MA1201",
                    "curriculumTitle": "Calculus II",
                    "creditUnits": 3,
                    "semester": "1B",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA1200"
                    ]
                },
                {
                    "courseId": "EE1001",
                    "curriculumTitle": "Foundations Digital Tech",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Mon",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE1002",
                    "curriculumTitle": "Principles Electrical Eng",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Tue",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE1004",
                    "curriculumTitle": "Foundations Info Systems",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Wed",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "GE1354",
                    "curriculumTitle": "Intro Electronic Design",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Fri",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "PHY1101",
                    "curriculumTitle": "Intro Classical Mechanics",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Fri",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "CS1302",
                    "curriculumTitle": "Intro Computer Programming",
                    "creditUnits": 3,
                    "semester": "1A",
                    "day": "Thu",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "MA2001",
                    "curriculumTitle": "Multi-variable Calculus",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "MA1201"
                    ]
                },
                {
                    "courseId": "EE2000",
                    "curriculumTitle": "Logic Circuit Design",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Tue",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE1001"
                    ]
                },
                {
                    "courseId": "EE2005",
                    "curriculumTitle": "Electronic Devices & Circuits",
                    "creditUnits": 3,
                    "semester": "2A",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE1002"
                    ]
                },
                {
                    "courseId": "CS2311",
                    "curriculumTitle": "Computer Programming",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Thu",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "CS1302"
                    ]
                },
                {
                    "courseId": "EE2800",
                    "curriculumTitle": "Semiconductor Physics",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Fri",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "PHY1101"
                    ],
                    "blocksCourseId": "EE3800",
                    "downstreamCourseId": "EE3801"
                },
                {
                    "courseId": "EE3121",
                    "curriculumTitle": "Diff Equations for EE",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Mon",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "MA2001"
                    ]
                },
                {
                    "courseId": "EE3210",
                    "curriculumTitle": "Signals and Systems",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Tue",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE2104",
                    "curriculumTitle": "Intro Electromagnetics",
                    "creditUnits": 3,
                    "semester": "2B",
                    "day": "Wed",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "MA1201"
                    ]
                },
                {
                    "courseId": "EE3800",
                    "curriculumTitle": "Semiconductor Materials",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Mon",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE2800"
                    ]
                },
                {
                    "courseId": "EE3008",
                    "curriculumTitle": "Principles of Comms",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Tue",
                    "timeSlot": "09:00"
                },
                {
                    "courseId": "EE3801",
                    "curriculumTitle": "Microsystems & Nanotech",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Wed",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE3800"
                    ]
                },
                {
                    "courseId": "EE2004",
                    "curriculumTitle": "Microcomputer Systems",
                    "creditUnits": 3,
                    "semester": "3A",
                    "day": "Thu",
                    "timeSlot": "09:00",
                    "prerequisiteCourseIds": [
                        "EE2000"
                    ]
                },
                {
                    "courseId": "EE4090",
                    "curriculumTitle": "Engineering Training",
                    "creditUnits": 0,
                    "semester": "3A",
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE3115",
                    "curriculumTitle": "Applied Opto-Electronic",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Fri",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE3122",
                    "curriculumTitle": "Analogue Circuit Fund",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Mon",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE2005"
                    ]
                },
                {
                    "courseId": "EE3220",
                    "curriculumTitle": "System-on-Chip Design",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Tue",
                    "timeSlot": "12:00",
                    "prerequisiteCourseIds": [
                        "EE2004"
                    ]
                },
                {
                    "courseId": "EE3070",
                    "curriculumTitle": "Design Project",
                    "creditUnits": 3,
                    "semester": "3B",
                    "day": "Wed",
                    "timeSlot": "12:00"
                },
                {
                    "courseId": "EE4080 A",
                    "curriculumTitle": "Final Year Project (Part A)",
                    "creditUnits": 3,
                    "semester": "4A",
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE4080 B",
                    "curriculumTitle": "Final Year Project (Part B)",
                    "creditUnits": 3,
                    "semester": "4B",
                    "prerequisiteCourseIds": [
                        "EE4080 A"
                    ],
                    "hasNoTimetableSlot": true
                },
                {
                    "courseId": "EE2066",
                    "curriculumTitle": "Engineers in Society",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Thu",
                    "timeSlot": "15:00"
                },
                {
                    "courseId": "TE_ELEC1",
                    "curriculumTitle": "Technical Elective 1",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Mon",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC2",
                    "curriculumTitle": "Technical Elective 2",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Tue",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC3",
                    "curriculumTitle": "Technical Elective 3",
                    "creditUnits": 3,
                    "semester": "4A",
                    "day": "Wed",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC4",
                    "curriculumTitle": "Technical Elective 4",
                    "creditUnits": 3,
                    "semester": "4B",
                    "day": "Thu",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                },
                {
                    "courseId": "TE_ELEC5",
                    "curriculumTitle": "Technical Elective 5",
                    "creditUnits": 3,
                    "semester": "4B",
                    "day": "Fri",
                    "timeSlot": "18:00",
                    "isTechnicalElective": true
                }
            ]
        }
    ],
    "comparisonProgrammes": [
        {
            "programmeId": "cityu-ee",
            "name": "CityU EE",
            "fullName": "BEng Electronic and Electrical Engineering",
            "university": "City University of Hong Kong",
            "career": "High employment in electronics, telecom, power systems, semiconductors & AI-related roles. Accredited by HKIE.",
            "difficulty": "Medium–High (strong foundation in maths, physics, circuits and programming required)",
            "internship": "Professional Internship Program (EE4085/86/87) — 4 to 12 months with industry partners",
            "link": "https://www.ee.cityu.edu.hk/en/current_students/undergraduate/major/admission_beng-elel_majorcurriculum"
        },
        {
            "programmeId": "hku-ee",
            "name": "HKU EE",
            "fullName": "BEng Electrical and Electronic Engineering",
            "university": "The University of Hong Kong",
            "career": "Strong graduate outcomes in power, communications, electronics, and fintech. Accredited by HKIE.",
            "difficulty": "High (rigorous maths, physics, and programming foundation required)",
            "internship": "Internship opportunities with CLP, HK Electric, Huawei, and other industry partners.",
            "link": "https://www.eee.hku.hk/"
        },
        {
            "programmeId": "polyu-ee",
            "name": "PolyU EE",
            "fullName": "BEng Electrical Engineering",
            "university": "The Hong Kong Polytechnic University",
            "career": "Graduates work in power, railway, telecom, and building services. Strong industry links.",
            "difficulty": "Medium–High (emphasis on practical engineering and hands-on projects)",
            "internship": "Work-integrated education (WIE) with MTR, CLP, and engineering firms.",
            "link": "https://www.polyu.edu.hk/eee/"
        },
        {
            "programmeId": "cuhk-ee",
            "name": "CUHK EE",
            "fullName": "BEng Electronic Engineering",
            "university": "The Chinese University of Hong Kong",
            "career": "Graduates work in electronics, communications, AI, and healthcare technology. Strong research-oriented training.",
            "difficulty": "High (strong emphasis on mathematics, physics, and programming)",
            "internship": "Summer internship programmes with tech companies and research labs.",
            "link": "https://www.ee.cuhk.edu.hk/"
        },
        {
            "programmeId": "ust-ee",
            "name": "UST EE",
            "fullName": "BEng Electronic and Computer Engineering",
            "university": "The Hong Kong University of Science and Technology",
            "career": "Strong outcomes in semiconductors, AI, robotics, and fintech. High employability in tech sector.",
            "difficulty": "High (rigorous engineering and computing foundation required)",
            "internship": "Internship opportunities with Huawei, DJI, and global tech firms.",
            "link": "https://ece.hkust.edu.hk/"
        }
    ],
    "studentProfiles": [],
    "generatedFeedbackTemplates": [
        [
            {
                "user": "EE Student 2023",
                "text": "This course is quite fundamental. The concepts in {{courseTitle}} are important for later courses. Workload is manageable if you review regularly."
            },
            {
                "user": "Year 2 Student",
                "text": "Lectures are clear but the tutorials are very useful. Make sure you understand the basic principles early."
            },
            {
                "user": "Anonymous",
                "text": "Good starting point. Not too difficult if you have solid secondary school physics/maths background."
            }
        ],
        [
            {
                "user": "CityU EE",
                "text": "{{courseCode}} requires consistent practice. The final exam can be tricky if you only memorize formulas."
            },
            {
                "user": "Senior Student",
                "text": "Interesting content. Lab sessions help a lot in understanding the theory."
            },
            {
                "user": "2024 Graduate",
                "text": "Useful course for building foundation. Recommend doing past papers."
            }
        ],
        [
            {
                "user": "EE Year 3",
                "text": "Workload is medium. Group project (if any) needs good time management."
            },
            {
                "user": "Student A",
                "text": "Professor explains well. Content is relevant to real engineering applications."
            },
            {
                "user": "Anonymous CityUer",
                "text": "A bit theoretical at times, but overall a solid course in the curriculum."
            }
        ]
    ]
};

    function freezeDeep(value) {
        Object.values(value).forEach((item) => {
            if (item && typeof item === 'object' && !Object.isFrozen(item)) {
                freezeDeep(item);
            }
        });
        return Object.freeze(value);
    }

    global.EE4213Data = freezeDeep(data);
})(window);
