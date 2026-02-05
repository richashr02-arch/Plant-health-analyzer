import { ReviewData, KeywordStat } from "../types";

const SHEET_ID = '1zmXD0dlAEBpJYcwwXCm6DNwE-1M30h3Di5Y7dSlm8q0';

// Google Visualization API endpoint
const DIRECT_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

// Robust CSV Parser
const parseCSV = (text: string): string[][] => {
  const arr: string[][] = [];
  let quote = false; 
  let row: string[] = [];
  let col = '';
  
  // Normalize line endings to \n to simplify logic
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let c = 0; c < cleanText.length; c++) {
    const cc = cleanText[c];
    const nc = cleanText[c+1];

    if (cc === '"') {
      if (quote && nc === '"') {
        // Double quote inside a quoted field -> literal quote
        col += '"';
        c++;
      } else {
        // Toggle quote state
        quote = !quote;
      }
    } else if (cc === ',' && !quote) {
      // End of column
      row.push(col);
      col = '';
    } else if (cc === '\n' && !quote) {
      // End of row
      row.push(col);
      arr.push(row);
      row = [];
      col = '';
    } else {
      col += cc;
    }
  }
  // Handle last row if no newline at end of file
  if (row.length > 0 || col.length > 0) {
    row.push(col);
    arr.push(row);
  }
  return arr;
};

export const getReviews = async (): Promise<ReviewData[]> => {
  try {
    console.log(`Fetching reviews directly from: ${DIRECT_SHEET_URL}`);
    
    const response = await fetch(DIRECT_SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Sheets: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();

    // Check for HTML response
    if (text.trim().startsWith("<!DOCTYPE html") || text.includes("google.com/accounts")) {
       console.error("Access Denied: Received login HTML page.");
       return [];
    }

    const rows = parseCSV(text);
    console.log("Parsed Rows Count:", rows.length);

    if (rows.length === 0) return [];

    // Log the header to confirm order
    console.log("Header Row:", rows[0]);

    // Assume first row is header, slice it off
    const dataRows = rows.slice(1);
    
    return dataRows.map((row, index) => {
      // Relaxed check: We need at least 5 columns to be useful
      if (row.length < 5) {
        return null;
      }

      // Safe access helper
      const getCol = (i: number) => row[i] ? row[i].trim() : "";

      // Corrected Mapping based on known CSV structure:
      // 0: Review_ID
      // 1: Customer_Name
      // 2: Review_Date
      // 3: Review_Text
      // 4: Sentiment
      // 5: Summary
      // 6: Keywords

      const keywordsRaw = getCol(6); 
      // Clean surrounding quotes if parser missed them (extra safety)
      const cleanKeywordsRaw = keywordsRaw.replace(/^"|"$/g, '');
      const keywords = cleanKeywordsRaw.split(',').map(k => k.trim()).filter(k => k.length > 0);

      // Normalize Sentiment (Column 4)
      let sentimentRaw = getCol(4);
      let sentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
      
      if (sentimentRaw.match(/positive/i)) sentiment = 'Positive';
      else if (sentimentRaw.match(/negative/i)) sentiment = 'Negative';
      else if (sentimentRaw.match(/neutral/i)) sentiment = 'Neutral';

      return {
        id: Number(getCol(0)) || Math.random(),
        customerName: getCol(1) || "Anonymous",
        reviewText: getCol(3) || "",     
        sentiment: sentiment,            
        summary: getCol(5) || "No summary", 
        keywords: keywords,              
        date: getCol(2) || new Date().toISOString().split('T')[0] 
      };
    })
    .filter((r): r is ReviewData => r !== null && r.reviewText.length > 0); 

  } catch (error) {
    console.error("Error loading review data:", error);
    return [];
  }
};

export const getSentimentStats = (reviews: ReviewData[]) => {
  if (!reviews || reviews.length === 0) return [];
  
  const positive = reviews.filter(r => r.sentiment === 'Positive').length;
  const negative = reviews.filter(r => r.sentiment === 'Negative').length;
  const neutral = reviews.filter(r => r.sentiment === 'Neutral').length;

  const stats = [
    { name: 'Positive', value: positive || 0, fill: '#10b981' }, 
    { name: 'Negative', value: negative || 0, fill: '#ef4444' }, 
    { name: 'Neutral', value: neutral || 0, fill: '#f59e0b' },  
  ];
  
  console.log("Sentiment Stats Calculated:", stats);
  return stats;
};

export const getKeywordStats = (reviews: ReviewData[]): KeywordStat[] => {
  const keywordCounts: Record<string, number> = {};
  
  reviews.forEach(review => {
    if (Array.isArray(review.keywords)) {
      review.keywords.forEach(keyword => {
        // Clean up keyword: remove quotes, extra spaces
        const cleanKey = keyword.replace(/['"]/g, '').trim();
        // Capitalize first letter for consistency
        const displayKey = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
        
        if (displayKey && displayKey.length > 2) {
            keywordCounts[displayKey] = (keywordCounts[displayKey] || 0) + 1;
        }
      });
    }
  });

  const stats = Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
    
  console.log("Keyword Stats Calculated:", stats);
  return stats;
};

export const getCriticalAlerts = (reviews: ReviewData[]): ReviewData[] => {
  return reviews
    .filter(r => r.sentiment === 'Negative')
    .slice(0, 5);
};