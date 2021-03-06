module.exports = {
    description: 'Lets you issue a warning to a member.',
    aliases: [],
    usage: 'warn <@User> <Reason>'
}

module.exports.run = async(client, message, args) => {
    const warn = args.slice(1).join(' ') || 'No Reason Specified'
    const member = message.mentions.members.first() || message.guild.member(args[0])
    const log = client.channels.cache.get(client.conf.logging.Warn_Channel_Logs)

    if (!message.member.hasPermission('MUTE_MEMBERS')) return message.channel.send(new client.embed().setDescription(`Sorry you are missing the permission \`MUTE_MEMBERS\`!`).setFooter(`${message.guild.name} | Made By Fuel#2649`, message.guild.iconURL({ dynamic: true })))
    if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send(new client.embed().setDescription(`Sorry, you are missing permissions to execute this command!`).setFooter(`${message.guild.name} | Made By Fuel#2649`, message.guild.iconURL({ dynamic: true })))
    if (!member) return message.channel.send(new client.embed().setDescription(`Please mention a user!`).setFooter(`${message.guild.name} | Made By Fuel#2649`, message.guild.iconURL({ dynamic: true })))
    if (member.id === message.author.id) return message.channel.send(new client.embed().setDescription('You can\'t warn yourself, please dont be a idiot!').setFooter(`${message.guild.name} | Made By Fuel#2649`, message.guild.iconURL({ dynamic: true })))
    if (member.user.bot) return message.channel.send(new client.embed().setDescription('You can\'t warn a bot').setFooter(`${message.guild.name} | Made By Fuel#2649`, message.guild.iconURL({ dynamic: true })))
    const casenum = client.settings.get(message.guild.id, 'cases').length + 1
    const warnings = client.members.ensure(message.guild.id, client.memberSettings, member.id).warns
    const embed = new client.embed()
        .setAuthor(`${message.author.tag} - (${message.author.id})`, message.author.displayAvatarURL({ dynamic: true }))
        .setDescription(`**Member:** ${member.user.tag} - (${member.user.id})\n**Action:** Warn\n**Reason:** ${warn}`)
        .setFooter(`Case ${casenum} | Made By Fuel#2649`, message.guild.iconURL({ dynamic: true }))
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(`YELLOW`)
        .setTimestamp()
    message.channel.send(embed)
    if (log) log.send(embed)

    client.members.push(message.guild.id, embed, `${member.id}.warnings`)
    client.members.push(message.guild.id, embed, `${member.id}.punishments`)
    client.settings.push(message.guild.id, embed, 'cases')
    member.send(embed.setTitle(`You were warned in ${message.guild.name}`)).catch(() =>
        message.channel.send(new client.embed().setDescription(`Failed to send a dm to ${member}, their dms are locked. FUCK.. I WANTED TO PISS THEM OFF!`).setFooter(`${message.guild.name} | Made By Fuel#2649`, message.guild.iconURL({ dynamic: true }))))

}