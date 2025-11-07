export const parseLeagueStatus = (status) => {
    // Store objects { value, label } instead of just strings
    const availability = { M: [], F: [] };
    let hasAnyOpen = false;
	const statusLines = (status.toString()).split(/\r\n/);
    statusLines.forEach(line => {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('- open')) {
            hasAnyOpen = true;
            const gender = lowerLine.includes('boys') ? 'M' : 'F';

            // Handle Kindergarten special case
            if (lowerLine.includes('kindergarten')) {
                availability[gender].push({ value: '13', label: 'K' });
            }

            // Handle numeric grade ranges
            const rangeMatch = line.match(/Grade[s]?:(\d+)(-(\d+))?/);
            if (rangeMatch) {
                const start = parseInt(rangeMatch[1]);
                const end = rangeMatch[3] ? parseInt(rangeMatch[3]) : start;
                for (let i = start; i <= end; i++) {
                    availability[gender].push({ 
                        value: String(i), 
                        label: String(i) 
                    });
                }
            }
        }
    });

    // Helper to sort: K (value 13) first, then numeric 1-12
    const gradeSorter = (a, b) => {
        // Force K (13) to be at the start of the list
        if (a.value === '13') return -1;
        if (b.value === '13') return 1;
        return parseInt(a.value) - parseInt(b.value);
    };

    return {
        isClosed: !hasAnyOpen,
        grades: {
            M: availability.M.sort(gradeSorter),
            F: availability.F.sort(gradeSorter)
        }
    };
};

export const createLegacyPayload = (formData) => {
    // 1. Start with standard family fields
    const flatData = {
        email: formData.email1, // Note: backend likely expects 'email', not 'email1' based on old form
        email2: formData.email2,
        ln: formData.lastName,
        mother_name: formData.motherName,
        father_name: formData.fatherName,
        phone: formData.phone,
        cell1: formData.cell1,
        cell2: formData.cell2,
        pref_contact: formData.prefContact,
        addr1: formData.addr1,
        addr2: formData.addr2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        ecn: formData.ecn,
        ecp: formData.ecp,
        comments: formData.comments,
        passcodetext: formData.passcode, // Match old form ID if needed
        num_players: formData.numPlayers
    };
	if (formData.id) {
		flatData.id=formData.id;
	}
    // 2. Loop through players and add with indexed keys (pname1, page1, etc.)
    // We only send data for the number of players selected
    for (let i = 0; i < formData.numPlayers; i++) {
        const player = formData.players[i];
        const suffix = i + 1; // 1-based index for backend
		console.log(player);
		if (player.id) {
             flatData[`pid${suffix}`] = player.id;
        }
        flatData[`pname${suffix}`] = player.name;
        // Handle special "OTHER" school case
        flatData[`pschool${suffix}`] = player.school === 'OTHER' ? player.otherSchool : player.school;
        flatData[`page${suffix}`] = player.age;
        flatData[`psex${suffix}`] = player.gender;
        flatData[`pgrade${suffix}`] = player.grade;
        flatData[`pshirt${suffix}`] = player.shirt;
        flatData[`pgrowth${suffix}`] = player.growth;
        // Convert boolean to backend-expected checkbox value (usually 'on' or '1')
        if (!player.isNewPlayer) {
             flatData[`preturning_player${suffix}`] = 'on';
        } else {
	       flatData[`preturning_player${suffix}`] = 0;
        }
        flatData[`pnew_bag${suffix}`] = player.wantsBag;
    }

	return flatData;
};

export const mapLegacyDataToState = (apiData) => {
	console.log(apiData);
    // 1. Always initialize 4 empty player slots
    const mappedPlayers = Array(4).fill(null).map((_, i) => {
        // Get player at index 'i' if it exists, otherwise empty object
        const pData = (apiData.players && apiData.players[i]) || {};

        return {
            id: pData.id || '',
            name: pData.name || '',
            // Check if school is standard list, otherwise 'OTHER'
            school: ['BPY', 'GBDS', 'Heatid', 'Lyncrest', 'MDS', 'Moriah', 'Noam', 'RYNJ', 'Yavneh'].includes(pData.school)
                ? pData.school || ''
                : (pData.school ? 'OTHER' : ''),
            otherSchool: !['BPY', 'GBDS', 'Heatid', 'Lyncrest', 'MDS', 'Moriah', 'Noam', 'RYNJ', 'Yavneh'].includes(pData.school)
                 ? pData.school || ''
                 : '',
            age: pData.age || '',
            gender: pData.gender || '', // assuming API returns 'M'/'F' directly
            grade: pData.grade || '',
            shirt: pData.shirt || '',
            growth: pData.growth || '',
            // Handle boolean/integer conversions
            isNewPlayer: !pData.returning_player, // or whatever the flag is called
            wantsBag: String(pData.new_bag || '0'),
            paid: parseInt(pData.paid || '0', 10)
        };
    });

    // 2. Map User Data
    return {
        id: apiData.id || '',
        email1: apiData.email || '',
        email2: apiData.email2 || '',
        lastName: apiData.last_name || '',
        motherName: apiData.mother_name || '',
        fatherName: apiData.father_name || '',
        phone: apiData.phone || '',
        cell1: apiData.cell1 || '',
        cell2: apiData.cell2 || '',
        prefContact: apiData.pref_contact || 'home',
        addr1: apiData.addr1 || '',
        addr2: apiData.addr2 || '',
        city: apiData.city || '',
        state: apiData.state || 'NJ',
        zip: apiData.zip || '',
        ecn: apiData.emerg_cont_name || '',
        ecp: apiData.emerg_cont_phone || '',
        comments: apiData.comments || '',
        passcode: '',
        // Ensure numPlayers matches actual returned players if not explicitly sent
        numPlayers: apiData.num_players ? parseInt(apiData.num_players, 10) : (apiData.players?.length || 1),
        players: mappedPlayers
    };
};