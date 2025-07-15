import { NewsItem, AdminUser, SystemConfig, SystemStats } from '@/types';

export const mockAdmins: AdminUser[] = [
  {
    id: '1',
    username: 'superadmin',
    email: 'superadmin@otito.com',
    role: 'superadmin',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-07T10:30:00Z',
    isActive: true,
  },
  {
    id: '2',
    username: 'admin1',
    email: 'admin1@otito.com',
    role: 'admin',
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-01-07T09:15:00Z',
    isActive: true,
  },
  {
    id: '3',
    username: 'admin2',
    email: 'admin2@otito.com',
    role: 'admin',
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: '2024-01-06T14:22:00Z',
    isActive: true,
  },
];

export const mockNewsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Breaking: Major Economic Policy Announced',
    twoLineSummary: 'Government announces new economic policy. Expected to boost GDP growth significantly.',
    fourLineSummary: 'The government has announced a comprehensive economic policy aimed at boosting growth. The policy includes tax reforms and infrastructure investments. Economists predict a positive impact on GDP. Implementation begins next quarter.',
    swipeSummary: 'New economic policy announced with tax reforms and infrastructure focus',
    fullDescription: 'In a major announcement today, the government unveiled a comprehensive economic policy package designed to stimulate growth across multiple sectors. The policy includes significant tax reforms, infrastructure investments, and support for small businesses. Leading economists have praised the move, predicting it could boost GDP growth by 2-3% over the next two years. The implementation will begin in the next quarter with a phased rollout across different sectors.',

    category: 'Economy',
    tags: ['policy', 'economy', 'government', 'growth'],
    isHeadline: true,
    isPublished: true,
    language: 'english',
    createdAt: '2024-01-07T08:00:00Z',
    updatedAt: '2024-01-07T08:30:00Z',
    publishedAt: '2024-01-07T08:30:00Z',
    imageUrl: '/api/placeholder/400/300',
    sourceUrl: 'https://newsdata.io/example1',
  },
  {
    id: '2',
    title: 'Tech Giant Announces Revolutionary AI Breakthrough',
    twoLineSummary: 'Major tech company reveals new AI technology. Claims to solve complex problems faster.',
    fourLineSummary: 'A leading technology company has announced a breakthrough in artificial intelligence. The new system can process complex data 10x faster than existing solutions. Applications include healthcare, finance, and research. Commercial release expected next year.',
    swipeSummary: 'AI breakthrough promises 10x faster processing for complex problems',
    fullDescription: 'A major technology corporation has unveiled what they claim is a revolutionary advancement in artificial intelligence processing. The new system, developed over three years, can handle complex computational problems at speeds 10 times faster than current market leaders. The technology has immediate applications in healthcare diagnostics, financial modeling, and scientific research. Beta testing begins next month with select partners, and commercial availability is expected by late next year.',

    category: 'Technology',
    tags: ['AI', 'technology', 'breakthrough', 'innovation'],
    isHeadline: false,
    isPublished: false,
    language: 'english',
    createdAt: '2024-01-07T09:00:00Z',
    updatedAt: '2024-01-07T09:00:00Z',
    lockedBy: '2',
    lockedAt: '2024-01-07T09:30:00Z',
    imageUrl: '/api/placeholder/400/300',
    sourceUrl: 'https://newsdata.io/example2',
  },
  {
    id: '3',
    title: 'भारत में नई शिक्षा नीति का प्रभाव',
    twoLineSummary: 'नई शिक्षा नीति से छात्रों को मिलेगा बेहतर अवसर। तकनीकी शिक्षा पर विशेष जोर।',
    fourLineSummary: 'भारत की नई शिक्षा नीति का क्रियान्वयन शुरू हो गया है। इससे छात्रों को बेहतर अवसर मिलेंगे। तकनीकी और व्यावसायिक शिक्षा पर विशेष जोर दिया गया है। शिक्षा मंत्रालय ने सकारात्मक परिणामों की उम्मीद जताई है।',
    swipeSummary: 'नई शिक्षा नीति से तकनीकी शिक्षा को बढ़ावा',
    fullDescription: 'भारत की नई राष्ट्रीय शिक्षा नीति 2020 का देशभर में क्रियान्वयन शुरू हो गया है। इस नीति के तहत छात्रों को पारंपरिक शिक्षा के साथ-साथ तकनीकी और व्यावसायिक शिक्षा के बेहतर अवसर प्राप्त होंगे। शिक्षा मंत्रालय के अनुसार, यह नीति भारत को वैश्विक ज्ञान महाशक्ति बनाने में महत्वपूर्ण भूमिका निभाएगी। विशेषज्ञों का मानना है कि इससे छात्रों की रोजगार क्षमता में वृद्धि होगी।',

    category: 'Education',
    tags: ['शिक्षा', 'नीति', 'तकनीकी', 'छात्र'],
    isHeadline: true,
    isPublished: true,
    language: 'hindi',
    createdAt: '2024-01-07T07:30:00Z',
    updatedAt: '2024-01-07T08:00:00Z',
    publishedAt: '2024-01-07T08:00:00Z',
    imageUrl: '/api/placeholder/400/300',
    sourceUrl: 'https://newsdata.io/example3',
  },
  {
    id: '4',
    title: 'खेल जगत में नया रिकॉर्ड',
    twoLineSummary: 'भारतीय खिलाड़ी ने अंतर्राष्ट्रीय स्तर पर नया रिकॉर्ड बनाया। देश के लिए गर्व की बात।',
    fourLineSummary: 'एक भारतीय खिलाड़ी ने अंतर्राष्ट्रीय प्रतियोगिता में नया विश्व रिकॉर्ड स्थापित किया है। यह उपलब्धि भारतीय खेल के इतिहास में मील का पत्थर है। खेल मंत्रालय ने खिलाड़ी को बधाई दी है। इससे युवाओं को प्रेरणा मिलेगी।',
    swipeSummary: 'भारतीय खिलाड़ी का नया विश्व रिकॉर्ड',
    fullDescription: 'भारत के एक युवा खिलाड़ी ने अंतर्राष्ट्रीय चैंपियनशिप में नया विश्व रिकॉर्ड स्थापित करके देश का नाम रोशन किया है। यह उपलब्धि भारतीय खेल के इतिहास में एक महत्वपूर्ण मील का पत्थर है। खेल मंत्रालय और प्रधानमंत्री ने खिलाड़ी को बधाई दी है। इस सफलता से देश के युवाओं को खेल के क्षेत्र में आगे बढ़ने की प्रेरणा मिलेगी।',

    category: 'Sports',
    tags: ['खेल', 'रिकॉर्ड', 'भारत', 'गर्व'],
    isHeadline: false,
    isPublished: false,
    language: 'hindi',
    createdAt: '2024-01-07T10:00:00Z',
    updatedAt: '2024-01-07T10:00:00Z',
    imageUrl: '/api/placeholder/400/300',
    sourceUrl: 'https://newsdata.io/example4',
  },
];

export const mockSystemConfig: SystemConfig = {
  id: '1',
  hindiPrompt: 'आपको समाचार को हिंदी में संक्षेप में प्रस्तुत करना है। समाचार को स्पष्ट, सटीक और आकर्षक बनाएं।',
  englishPrompt: 'You need to present the news in English concisely. Make the news clear, accurate and engaging.',
  newsFrequency: 30, // 30 minutes
  autoPublish: false,
  maxNewsPerBatch: 10,
  categories: ['Politics', 'Economy', 'Technology', 'Sports', 'Entertainment', 'Health', 'Education', 'Environment'],
};

export const mockSystemStats: SystemStats = {
  totalAdmins: 3,
  totalNews: 156,
  publishedNews: 98,
  unpublishedNews: 58,
  totalHeadlines: 12,
  newsPublishedToday: 8,
  newsPublishedThisWeek: 34,
  newsPublishedThisMonth: 156,
};

// Mock authentication function
export const mockLogin = async (username: string, password: string): Promise<AdminUser | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock authentication logic
  const user = mockAdmins.find(admin => admin.username === username);
  if (user && password === 'password') {
    return user;
  }
  return null;
}; 