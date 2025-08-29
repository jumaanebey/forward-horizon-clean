export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  if (req.method === 'POST' && action === 'schedule') {
    try {
      const { 
        content, 
        platforms,
        scheduledDate,
        postType,
        mediaUrl,
        hashtags,
        targetAudience 
      } = req.body;
      
      if (!content || !platforms || !scheduledDate) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: content, platforms, scheduledDate'
        });
      }

      const postId = `SOCIAL-${Date.now()}`;
      
      const scheduledPost = {
        id: postId,
        content,
        platforms: platforms, // ['facebook', 'instagram', 'twitter', 'linkedin']
        scheduledDate: new Date(scheduledDate).toISOString(),
        postType: postType || 'general', // 'announcement', 'success-story', 'fundraiser', 'volunteer-call', 'general'
        mediaUrl: mediaUrl || null,
        hashtags: hashtags || [],
        targetAudience: targetAudience || 'general',
        status: 'scheduled',
        createdDate: new Date().toISOString(),
        estimatedReach: calculateEstimatedReach(platforms, postType),
        approvalStatus: 'pending'
      };

      // Generate platform-specific content
      const platformContent = generatePlatformContent(scheduledPost);

      // Create approval workflow
      const approvalWorkflow = {
        required: true,
        approvers: ['Social Media Manager', 'Communications Director'],
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        status: 'pending'
      };

      return res.status(200).json({
        success: true,
        message: `Social media post scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
        scheduledPost,
        platformContent,
        approvalWorkflow,
        nextSteps: [
          'Content review and approval',
          'Media preparation (if applicable)',
          'Automated posting at scheduled time',
          'Performance tracking'
        ],
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Social media scheduling error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }

  if (req.method === 'POST' && action === 'auto-generate') {
    try {
      const { trigger, data } = req.body;
      
      if (!trigger) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: trigger'
        });
      }

      const generatedContent = generateAutomaticContent(trigger, data);

      return res.status(200).json({
        success: true,
        message: `Auto-generated content for ${trigger}`,
        generatedContent,
        recommendations: {
          bestTimes: ['9:00 AM', '1:00 PM', '7:00 PM'],
          platforms: generatedContent.recommendedPlatforms,
          hashtags: generatedContent.suggestedHashtags
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Auto-generation error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error' 
      });
    }
  }

  if (req.method === 'GET' && action === 'scheduled') {
    const status = req.query.status || 'all';
    const upcomingPosts = [
      {
        id: 'SOCIAL-001',
        content: '🏠 We have 3 beds available this week! Veterans in need of transitional housing, please contact us. Your journey to independence starts here. #Veterans #Housing #Support',
        platforms: ['facebook', 'twitter', 'linkedin'],
        scheduledDate: '2025-03-01T09:00:00Z',
        postType: 'announcement',
        status: 'approved',
        estimatedReach: 2500
      },
      {
        id: 'SOCIAL-002',
        content: 'Success Story Saturday: Meet John, a Marine veteran who completed our program and now has his own apartment and stable job. Stories like his remind us why we do this work. 💪 #SuccessStory #Veterans',
        platforms: ['facebook', 'instagram'],
        scheduledDate: '2025-03-02T13:00:00Z',
        postType: 'success-story',
        status: 'pending-approval',
        estimatedReach: 1800
      },
      {
        id: 'SOCIAL-003',
        content: '🤝 Volunteer Spotlight: Thank you to our amazing volunteers who served 200 meals this month! Want to join our team? Link in bio. #Volunteers #Community',
        platforms: ['instagram', 'facebook'],
        scheduledDate: '2025-03-03T19:00:00Z',
        postType: 'volunteer-call',
        status: 'scheduled',
        estimatedReach: 1200
      }
    ];

    const filteredPosts = status === 'all' ? 
      upcomingPosts : 
      upcomingPosts.filter(p => p.status === status);

    return res.status(200).json({
      scheduledPosts: filteredPosts,
      summary: {
        total: filteredPosts.length,
        approved: filteredPosts.filter(p => p.status === 'approved').length,
        pending: filteredPosts.filter(p => p.status === 'pending-approval').length,
        scheduled: filteredPosts.filter(p => p.status === 'scheduled').length,
        totalEstimatedReach: filteredPosts.reduce((sum, p) => sum + p.estimatedReach, 0)
      },
      lastUpdated: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && action === 'analytics') {
    const timeframe = req.query.timeframe || 'month';
    
    return res.status(200).json({
      performance: {
        postsPublished: 28,
        totalReach: 45670,
        totalEngagement: 3420,
        engagementRate: 7.5,
        clickThroughRate: 2.3,
        newFollowers: 156,
        topPerformingPost: 'Bed availability announcement - 5.2K reach'
      },
      byPlatform: {
        facebook: {
          posts: 12,
          reach: 18900,
          engagement: 1890,
          growthRate: 8.2
        },
        instagram: {
          posts: 8,
          reach: 12450,
          engagement: 1020,
          growthRate: 12.5
        },
        twitter: {
          posts: 6,
          reach: 8900,
          engagement: 380,
          growthRate: 5.1
        },
        linkedin: {
          posts: 2,
          reach: 5420,
          engagement: 130,
          growthRate: 3.8
        }
      },
      contentTypes: {
        'announcements': { posts: 8, avgReach: 2100, avgEngagement: 180 },
        'success-stories': { posts: 6, avgReach: 1850, avgEngagement: 220 },
        'volunteer-calls': { posts: 5, avgReach: 1200, avgEngagement: 95 },
        'fundraising': { posts: 4, avgReach: 2800, avgEngagement: 340 },
        'general': { posts: 5, avgReach: 980, avgEngagement: 85 }
      },
      bestTimes: {
        facebook: ['9:00 AM', '1:00 PM', '7:00 PM'],
        instagram: ['11:00 AM', '2:00 PM', '8:00 PM'],
        twitter: ['8:00 AM', '12:00 PM', '6:00 PM'],
        linkedin: ['9:00 AM', '3:00 PM']
      },
      trending: {
        hashtags: ['#Veterans', '#Housing', '#Support', '#Community', '#Healing'],
        topics: ['Bed availability', 'Success stories', 'Volunteer opportunities', 'Fundraising events']
      },
      lastUpdated: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && action === 'templates') {
    return res.status(200).json({
      templates: {
        'bed-availability': {
          title: 'Bed Availability Announcement',
          content: '🏠 We have {bedCount} beds available this week! {targetGroup} in need of transitional housing, please contact us. Your journey to independence starts here.',
          hashtags: ['#Veterans', '#Housing', '#Support', '#Transitional'],
          platforms: ['facebook', 'twitter', 'linkedin'],
          variables: ['bedCount', 'targetGroup']
        },
        'success-story': {
          title: 'Success Story Post',
          content: 'Success Story {dayOfWeek}: Meet {name}, a {veteranBranch} veteran who {achievement}. Stories like this remind us why we do this work. 💪',
          hashtags: ['#SuccessStory', '#Veterans', '#Inspiration', '#Journey'],
          platforms: ['facebook', 'instagram'],
          variables: ['dayOfWeek', 'name', 'veteranBranch', 'achievement']
        },
        'volunteer-call': {
          title: 'Volunteer Recruitment',
          content: '🤝 Join our volunteer team! We need help with {activity}. Make a difference in veterans\' lives. {timeCommitment} Link in bio.',
          hashtags: ['#Volunteers', '#Community', '#MakeADifference', '#Veterans'],
          platforms: ['facebook', 'instagram', 'linkedin'],
          variables: ['activity', 'timeCommitment']
        },
        'donation-drive': {
          title: 'Fundraising Campaign',
          content: '💝 Help us reach our goal! ${currentAmount} raised of ${goalAmount} for {cause}. Every dollar makes a difference. Donate: {link}',
          hashtags: ['#Donate', '#Veterans', '#Support', '#Community'],
          platforms: ['facebook', 'twitter', 'linkedin'],
          variables: ['currentAmount', 'goalAmount', 'cause', 'link']
        },
        'event-announcement': {
          title: 'Event Promotion',
          content: '📅 Join us for {eventName} on {date} at {time}! {eventDescription} RSVP: {link}',
          hashtags: ['#Event', '#Community', '#Veterans', '#Support'],
          platforms: ['facebook', 'instagram', 'linkedin'],
          variables: ['eventName', 'date', 'time', 'eventDescription', 'link']
        }
      },
      automatedTriggers: {
        'bed-available': 'Auto-post when beds become available',
        'donation-received': 'Thank donors automatically',
        'volunteer-signup': 'Welcome new volunteers',
        'resident-milestone': 'Celebrate resident achievements',
        'program-completion': 'Congratulate program graduates'
      },
      lastUpdated: new Date().toISOString()
    });
  }

  return res.status(400).json({ 
    error: 'Invalid action or method',
    availableActions: ['schedule', 'auto-generate', 'scheduled', 'analytics', 'templates'],
    examples: {
      schedule: 'POST /api/social?action=schedule',
      autoGenerate: 'POST /api/social?action=auto-generate',
      scheduled: 'GET /api/social?action=scheduled&status=pending',
      analytics: 'GET /api/social?action=analytics&timeframe=month',
      templates: 'GET /api/social?action=templates'
    }
  });
}

function calculateEstimatedReach(platforms, postType) {
  const baseReach = {
    facebook: 1500,
    instagram: 800,
    twitter: 600,
    linkedin: 400
  };

  const typeMultipliers = {
    'announcement': 1.8,
    'success-story': 1.4,
    'fundraiser': 2.2,
    'volunteer-call': 1.1,
    'general': 1.0
  };

  const totalReach = platforms.reduce((sum, platform) => {
    return sum + (baseReach[platform] || 500) * (typeMultipliers[postType] || 1.0);
  }, 0);

  return Math.round(totalReach);
}

function generatePlatformContent(post) {
  const content = {};
  
  post.platforms.forEach(platform => {
    switch (platform) {
      case 'facebook':
        content[platform] = {
          text: post.content,
          hashtags: post.hashtags.slice(0, 3), // Facebook: fewer hashtags
          callToAction: 'Learn More',
          targetAudience: post.targetAudience
        };
        break;
      
      case 'instagram':
        content[platform] = {
          text: post.content.substring(0, 150) + '...\n\n' + post.hashtags.join(' '),
          hashtags: post.hashtags.slice(0, 10), // Instagram: more hashtags
          mediaRequired: true,
          stories: true
        };
        break;
      
      case 'twitter':
        content[platform] = {
          text: post.content.substring(0, 240), // Twitter character limit
          hashtags: post.hashtags.slice(0, 2),
          thread: post.content.length > 240
        };
        break;
      
      case 'linkedin':
        content[platform] = {
          text: post.content + '\n\n#ForwardHorizon #ProfessionalNetworking',
          hashtags: post.hashtags.slice(0, 3),
          professional: true,
          targetAudience: 'professionals'
        };
        break;
    }
  });
  
  return content;
}

function generateAutomaticContent(trigger, data) {
  const contentTemplates = {
    'bed-available': {
      content: `🏠 Great news! We have ${data?.bedCount || 'several'} beds available for ${data?.targetGroup || 'those in need'}. If you or someone you know needs transitional housing support, please reach out. We're here to help you take the next step toward independence.`,
      recommendedPlatforms: ['facebook', 'twitter', 'linkedin'],
      suggestedHashtags: ['#BedAvailable', '#Veterans', '#Housing', '#Support'],
      postType: 'announcement',
      urgency: 'high'
    },
    'donation-received': {
      content: `🙏 Thank you ${data?.donorName || 'anonymous donor'} for your generous donation of $${data?.amount || '100'}! Your support directly impacts the lives of veterans and individuals working toward independence. Every contribution makes a difference.`,
      recommendedPlatforms: ['facebook', 'instagram'],
      suggestedHashtags: ['#ThankYou', '#Donors', '#Support', '#Community'],
      postType: 'general',
      urgency: 'medium'
    },
    'volunteer-signup': {
      content: `🤝 Welcome to our newest volunteer, ${data?.name || 'our new team member'}! We're excited to have you join our mission of supporting veterans and individuals on their journey to independence. Together, we make a difference!`,
      recommendedPlatforms: ['facebook', 'instagram'],
      suggestedHashtags: ['#NewVolunteer', '#Welcome', '#Team', '#Volunteers'],
      postType: 'volunteer-call',
      urgency: 'low'
    },
    'resident-milestone': {
      content: `🎉 Congratulations to ${data?.name || 'one of our residents'} for achieving ${data?.milestone || 'an important milestone'}! These moments remind us why we do this work. Every step forward is worth celebrating.`,
      recommendedPlatforms: ['facebook', 'instagram'],
      suggestedHashtags: ['#Milestone', '#Success', '#Progress', '#Celebration'],
      postType: 'success-story',
      urgency: 'medium'
    },
    'program-completion': {
      content: `🎓 Today we celebrate ${data?.name || 'another graduate'} who has successfully completed our transitional housing program! ${data?.achievement || 'They now have stable housing and employment.'} We're so proud and wish them continued success!`,
      recommendedPlatforms: ['facebook', 'instagram', 'linkedin'],
      suggestedHashtags: ['#Graduate', '#Success', '#Independence', '#Proud'],
      postType: 'success-story',
      urgency: 'high'
    }
  };

  return contentTemplates[trigger] || {
    content: 'Update from Forward Horizon Transitional Housing',
    recommendedPlatforms: ['facebook'],
    suggestedHashtags: ['#ForwardHorizon'],
    postType: 'general',
    urgency: 'low'
  };
}