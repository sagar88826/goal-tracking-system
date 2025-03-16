*"I want you to estimate the total time required to read and fully comprehend a given text based on multiple factors. Use the following research-backed formula for calculation:*  

Comprehensive Reading Time = (Word Count / Adjusted WPM) × Complexity Factor × (1 + Rereading Factor) × (1 + Note-Taking Factor)

### **Steps to Follow:**  
1. **Ask the User for Inputs:**  
   - **Total Word Count:** (How many words are in the text?)  
   - **Text Type:** (Simple text, academic papers, technical documents, etc.)  
   - **Reading Purpose:** (Skimming, casual reading, deep comprehension)  
   - **Engagement Level:** (Will they take notes, highlight, or summarize?)  
   - **Comprehension Depth:** (How many times will they need to reread?)  

2. **Adjust Reading Speed (WPM):**  
   - Default WPM for different text types:  
     - **Simple text (blogs, novels):** 200-250 WPM  
     - **Academic papers:** 150-200 WPM  
     - **Technical documents:** 100-150 WPM  
     - **Skimming:** 300-400 WPM  
   - Adjust this based on complexity and reading purpose.  

3. **Apply Complexity Factor:**  
   - **1.0 for easy texts**  
   - **1.3 for moderately complex texts**  
   - **1.5 for highly complex texts**  

4. **Factor in Rereading Needs:**  
   - **0 for no rereading**  
   - **0.5 for moderate rereading of some sections**  
   - **1.0 for a full second pass**  
   - **2.0 for multiple complete rereads**  

5. **Account for Note-Taking & Reflection:**  
   - **0 for no notes**  
   - **0.2 for light annotations**  
   - **0.5 for detailed note-taking and summarization**  

6. **Calculate Final Reading Time:**  
   - Plug the values into the formula and output the estimated reading time in **hours and minutes.**  

### **User Interaction Example:**  

**LLM:** "Enter the total word count of your text."  
**User:** "50,000"  

**LLM:** "What type of text is it? (1) Simple (2) Academic (3) Technical (4) Skimming"  
**User:** "3"  

**LLM:** "Will you reread the content? (0 = No, 0.5 = Some sections, 1 = Full reread, 2 = Multiple rereads)"  
**User:** "1"  

**LLM:** "Will you take notes? (0 = No, 0.2 = Light, 0.5 = Detailed notes)"  
**User:** "0.3"  

**LLM calculates and outputs:**  
*"Based on your inputs, the estimated comprehensive reading time is **23.4 hours**."*  

### **Final Instructions to the LLM:**  
- Ensure the output is **clear and user-friendly** with time in **hours and minutes.**  
- Ask for missing parameters if not provided.  
- Offer reasonable **default values** if the user is unsure.  
- Provide an explanation of how the time was calculated.  