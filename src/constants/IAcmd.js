module.exports = [
    //Help
    {input: 'help me about', output: 'help1', function: 'help'},
    {input: 'help about', output: 'help1', function: 'help'},
    {input: 'help me for', output: 'help1', function: 'help'},
    {input: 'help for', output: 'help1', function: 'help'},
    {input: 'can you help me', output: 'help4', function: 'help'},
    {input: 'help me', output: 'help4', function: 'help'},
    {input: 'show me help message', output: 'help4', function: 'help'},

    //Search
    {input: 'can you search', output: 'search', function: 'search'},
    {input: 'show me information for', output: 'search', function: 'search'},

    //Kitsu
    {input: 'can you give me a random anime', output: 'randomanime', function: 'kitsu'},
    {input: 'can you give me random anime', output: 'randomanime', function: 'kitsu'},
    {input: 'can i get random anime', output: 'randomanime', function: 'kitsu'},
    {input: 'can i get a random anime', output: 'randomanime', function: 'kitsu'},
    {input: 'do you have anime for me', output: 'randomanime', function: 'kitsu'},
    {input: 'do you have a anime for me', output: 'randomanime', function: 'kitsu'},
    {input: 'can i get the leaderboard', output: 'leaderboard', function: 'kitsu'},
    {input: 'can you give me the leaderboard', output: 'leaderboard', function: 'kitsu'},
    {input: 'give me the leaderboard', output: 'leaderboard', function: 'kitsu'},

    //Osu
    {input: 'roll', output: 'roll', function: 'osu'},
    {input: 'top score for', output: 'osubest', function: 'osu'},
    {input: 'top score about', output: 'osubest', function: 'osu'},

    //Server
    {input: ' clear ', output: 'clear', function: 'server'},

]