const { chunk } = require('lodash')

module.exports = {
    description: 'Run this command to apply for an application on the server.',
    aliases: [],
    usage: 'apply'
}

module.exports.run = async(client, message, args) => {
    const applications = client.conf.applicationSystem.applications.filter(s => !s.Application_Channel || s.Application_Channel === message.channel.id)
    const app = applications.find(a => a.Application_Name.toLowerCase() === args.join(' ').toLowerCase())

    if (!applications.length) return message.channel.send(new client.embed().setDescription('I couldnt find any applications available in this channel!'))
    if (!app) return message.channel.send(new client.embed().setDescription(`I couldnt find an application with that name!\nRun \`${message.px}applications\` to view this channels available applications.`))

    const chan = client.channels.cache.get(app.Application_Log)
    if (!chan) return message.author.send('Sorry but I couldnt find this applications log channel.').catch(() => {})
    const msg = await message.author.send(
        new client.embed()
        .setTitle('Application Process')
        .setDescription(`Please confirm that you would like to start the application by reacting below.\nYou can send \`cancel\` at any time to cancel the application.`)).catch(() => {})

    if (!msg) return
    await msg.react('✅')
    await msg.react('❎')
    const resp = await msg.awaitReactions((_, u) => !u.bot, { max: 1, time: 20000 })
    if (!resp.first()) return msg.channel.send('Time limit exceeded, application cancelled.')
    else if (resp.first().emoji.name !== '✅') return msg.channel.send('Application cancelled.')
    const questions = app.questions
    const answers = []
    client.processes.set(message.author.id, true)

    for (var i in questions) {
        await msg.channel.send(new client.embed().setTitle(`Question ${(Number(i) + 1)}`).setDescription(questions[i]))
        const resp = await msg.channel.awaitMessages((_, u) => !u.bot, { max: 1, time: 60000 })
        if (!resp.first()) return msg.channel.send(new client.embed().setDescription('Time limit exceeded, application cancelled.'))
        if (resp.first().content === 'cancel') return message.channel.send(new client.embed().setDescription('The application has been cancelled.'))
        answers.push(resp.first().content)
    }

    const msg2 = await msg.channel.send(new client.embed().setDescription('The application has been completed! Are you sure you wish to apply?'))
    await msg2.react('✅')
    await msg2.react('❎')

    const resp2 = await msg2.awaitReactions((_, u) => !u.bot, { max: 1, time: 20000 })
    if (!resp2.first()) return msg.channel.send('Time limit exceeded, application cancelled.')
    else if (resp2.first().emoji.name !== '✅') return msg.channel.send('Application cancelled.')

    const description = answers.map((s, i) => questions[i] + '\n' + s).join('\n\n').match(/[^]{1,1950}/g)
    const embed2 = new client.embed()
        .setTitle(`New application from ${message.author.tag}`)
        .setDescription(description.splice(0, 1))
    if (!description.length) embed2.setFooter(`${message.guild.name} | Made by the devs`, message.guild.iconURL({ dynamic: true }))

    msg.channel.send(new client.embed().setTitle('Application Complete').setDescription('✅ Your application has been successfully submitted.'))
    client.processes.delete(message.author.id)

    await chan.send(embed2)
    for (let s of description) await chan.send(new client.embed().setDescription(s))


    if (description.length) chan.send(new client.embed().setDescription('This application was split due to discord character limit.').setFooter(`${message.guild.name} | Made by the devs`, message.guild.iconURL({ dynamic: true })))
}