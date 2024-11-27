class ChatGPT {
    constructor() {
      this.apiKey = null;
      this.lastErrorMessage = '';
      this.conversationHistory = [];
      this.systemPrompt = '';
    }
  
    getInfo() {
      return {
        id: 'kokofixcomputerschatgptext',
        name: 'ChatGPT Extension',
        blocks: [
          {
           opcode:'__showWarningAlert', 
           blockType : Scratch.BlockType.LABEL, 
           text : '⚠️ Warning: Information provided\n from AI may be inaccurate.\n Verify important information.'
          },
          {
            opcode:'__showinfoAlert', 
            blockType : Scratch.BlockType.LABEL, 
            text : 'ℹ️ Info: Please note that this\n extension requires an API key to function.\n You can get an API key here:\n https://platform.openai.com/account/api-keys'
           },
          {
            opcode: 'getResponse',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get response [input] (model [model])',
            arguments: {
              input: {
                type: 'string',
                defaultValue: 'Hello, world!'
              },
              model: {
                type: 'string',
                menu: 'models'
              }
            }
          },
          {
            opcode: 'getResponseWithHistory',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get response [input] (model [model]) with conversation history [json]',
            arguments: {
              input: {
                type: 'string',
                defaultValue: 'Hello, world!'
              },
              model: {
                type: 'string',
                menu: 'models'
              },
              json: {
                type: 'string',
                defaultValue: '[{"role": "user", "content": "Previous message"}]'
              }
            }
          },
          {
            opcode: 'addToConversationHistory',
            blockType: Scratch.BlockType.COMMAND,
            text: 'add to conversation history [role] [message]',
            arguments: {
              role: {
                type: 'string',
                menu: 'roles'
              },
              message: {
                type: 'string',
                defaultValue: 'New message'
              }
            }
          },
          {
            opcode: 'getConversationHistory',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get conversation history'
          },
          {
            opcode: 'isApiKeySet',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is API key set?'
          },
          {
            opcode: 'setApiKey',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set API key [key]',
            arguments: {
              key: {
                type: 'string',
                defaultValue: 'YOUR_API_KEY_HERE'
              }
            }
          },
          {
            opcode: 'clearApiKey',
            blockType: Scratch.BlockType.COMMAND,
            text: 'clear API key'
          },
          {
            opcode: 'getApiKey',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get API key'
          },
          {
            opcode: 'getLastErrorMessage',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get last error message'
          },
          {
            opcode: 'logApiResponse',
            blockType: Scratch.BlockType.COMMAND,
            text: 'log API response for [input] (model [model])',
            arguments: {
              input: {
                type: 'string',
                defaultValue: 'Hello, world!'
              },
              model: {
                type: 'string',
                menu: 'models'
              }
            }
          },
          {
            opcode: 'setConversationHistory',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set conversation history [jsonString]',
            arguments: {
              jsonString: {
                type: 'string',
                defaultValue:
                  '[{"role": "system", "content": "Your name is ChatGPT."},{"role": "user", "content": "Hello"},{"role": "assistant", "content": "Hello, How can i assist you today?"}]'
              }
            }
          },
          {
            opcode: 'clearConversationHistory',
            blockType: Scratch.BlockType.COMMAND,
            text: 'clear conversation history'
          },
          {
            opcode: 'setSystemPrompt',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set system prompt [prompt]',
            arguments: {
              prompt: {
                type: 'string',
                defaultValue: 'System prompt here'
              }
            }
          },
          {
            opcode: 'isApiKeyValid',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is API key valid?',
            disableMonitor: true
          }
        ],
        menus: {
          models:['o1-mini', 'o1-preview', 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo', 'text-davinci-003', 'text-curie-001', 'text-babbage-001', 'text-ada-001'],
          roles:['user', 'assistant']
        }
      };
    }
  
    async getResponse(args) {
      const input = args.input;
      const model = args.model;
  
      if (!this.apiKey) {
        this.lastErrorMessage =  'Error : API key not set'; 
        return 'Error : API key not set';
      }
  
      try {
        const messages = [];
  
        if (this.systemPrompt !== '') {
          messages.unshift({ role:'system', content:this.systemPrompt });
        }
  
        // Add existing conversation history
        this.conversationHistory.forEach((message) => {
          messages.push(message);
        });
  
        // Add the user's message
        messages.push({ role:'user', content : input });
  
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST',
          headers:{
             'Content-Type': 'application/json', 
             Authorization:`Bearer ${this.apiKey}`
           }, 
           body : JSON.stringify({ 
             model, 
             messages 
           }) 
         });
  
         if (!response.ok) { 
           this.lastErrorMessage =  'Error : ' + errorData.error.message;
           const errorData = await response.json(); 
           return `Error:${errorData.error.message}`; 
         } 
  
         const data = await response.json(); 
         const responseContent = data.choices[0].message.content; 
    
         return responseContent; // Return the assistant's response
       } catch (error) { 
         this.lastErrorMessage =  'Error : Failed to fetch response'; 
         console.error('Error fetching ChatGPT response:', error); 
         return'Error : Failed to fetch response'; 
       } 
     }
  
    async getResponseWithHistory(args) { 
      const input = args.input;
      const model = args.model;
      const jsonHistory = args.json;
  
      if (!this.apiKey) { 
        this.lastErrorMessage =  'Error : API key not set'; 
        return'Error : API key not set'; 
      }
  
      try { 
        const messages = []; 
  
        if (this.systemPrompt !== '') { 
           messages.unshift({ role:'system', content:this.systemPrompt }); 
         } 
  
         // Parse the provided JSON conversation history
         let parsedHistory;
         try { 
           parsedHistory = JSON.parse(jsonHistory); 
         } catch (error) { 
           this.lastErrorMessage =  'Error : Invalid JSON format for conversation history'; 
           return'Error : Invalid JSON format for conversation history'; 
         }
  
         // Add parsed conversation history to messages without modifying internal state
         parsedHistory.forEach((message) => { 
           messages.push(message); 
         });
  
         // Add the user's message
         messages.push({ role:'user', content : input });
  
         const response = await fetch('https://api.openai.com/v1/chat/completions', { 
           method:'POST', 
           headers:{ 
             'Content-Type': 'application/json', 
             Authorization:`Bearer ${this.apiKey}` 
           }, 
           body : JSON.stringify({ 
             model, 
             messages 
           }) 
         });
  
         if (!response.ok) { 
           this.lastErrorMessage =  'Error : ' + errorData.error.message;
           const errorData = await response.json(); 
           return `Error:${errorData.error.message}`; 
         } 
  
         const data = await response.json(); 
         const responseContent = data.choices[0].message.content; 
  
         return responseContent; // Return the assistant's response
       } catch (error) {  
         console.error('Error fetching ChatGPT response:', error);  
         this.lastErrorMessage =  'Error : Failed to fetch response'; 
         return'Error : Failed to fetch response';  
       }  
     }
  
    addToConversationHistory(args) { 
      const role = args.role; // Get the role (user or assistant)
      const message = args.message; // Get the message
      this.conversationHistory.push({ role, content : message }); // Add to conversation history
    }
  
    getConversationHistory() { 
      return JSON.stringify(this.conversationHistory); 
    }
  
    isApiKeySet() { 
      return this.apiKey !== null; 
    }
  
    setApiKey(args) { 
      return new Promise((resolve, reject) => { 
        try { 
          this.apiKey = args.key; 
           resolve(); 
         } catch (error) { 
           this.lastErrorMessage =  'Error setting API key'; 
           reject(error); 
         } 
       }); 
     }
  
     clearApiKey() { 
       this.apiKey = null; 
       return Promise.resolve(); 
     }
  
     getApiKey() { 
       return this.apiKey ||'API key not set'; 
     }
  
     getLastErrorMessage() { 
       return this.lastErrorMessage; 
     }
  
     logApiResponse(args) { 
       this.getResponse(args).then((response) => { 
         console.log('API Response:', response); 
       }); 
     }
  
     setConversationHistory(args) { 
       try { 
         this.conversationHistory = JSON.parse(args.jsonString);  
       } catch (error) {  
         console.error('Error parsing conversation history JSON:', error);  
       }  
     }
  
     setSystemPrompt(args) {  
       this.systemPrompt = args.prompt;  
     }  
  
     clearConversationHistory() {  
       this.conversationHistory = [];  
     }  
  
     async isApiKeyValid() {  
       if (!this.apiKey) return false;
  
       try {  
         const response = await fetch('https://api.openai.com/v1/models', { // Simple request to check validity
           method:'GET',
           headers:{
             Authorization:`Bearer ${this.apiKey}`
           }
         });
  
         return response.ok; // Returns true if the API key is valid
       } catch (error) {  
         this.lastErrorMessage =  'Error checking API key validity: ' + error; 
         console.error('Error checking API key validity:', error);
         return false; // Returns false on error
       }
     }
  
     _shutdown() {}
  
     _getStatus() {  
       return{ status :2, msg:'Ready' };  
     }  
  }
  
  Scratch.extensions.register(new ChatGPT());