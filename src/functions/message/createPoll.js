const { PollLayoutType } = require("discord.js");
const { Time } = require("../../utils/helpers/customParser.js");

module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);

    const [channelId = d.channel?.id, question, duration, allowMultiselect = "false", ...answers] = data.inside.splits;

    let poll = question;
    const channel = await d.util.getChannel(d, channelId);

    try {
        poll = JSON.parse(poll);
    } catch {
        const time = Time.parse(duration)?.ms / 3600000;

        if (!channel) return d.aoiError.fnError(d, "channel", { inside: data.inside });
        if (!time) return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Invalid Time Provided In");
        if (Math.floor(time) > 168) return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Poll duration must be less than or equal to 7 days");
        if (Math.floor(time) < 1) return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Poll duration must be longer than or equal 1 hour");

        answers.forEach((x) => {
            const answer = x.split(":");
            let emoji = answer[1];

            try {
                emoji = d.util.getEmoji(d, emoji.addBrackets()).id;
            } catch {
                emoji = emoji?.addBrackets() ?? undefined;
            }

            answers[answers.indexOf(x)] = {
                text: answer[0],
                emoji
            };
        });

        if (answers.length > 10) return d.aoiError.fnError(d, "custom", { inside: data.inside }, "Poll answers must be less than or equal to 10");

        poll = {
            question: { text: question },
            duration: time,
            allowMultiselect: allowMultiselect === "true",
            layout: PollLayoutType.Default,
            answers
        };
    }

    channel.send({
        poll: poll
    });

    return {
        code: d.util.setCode(data)
    };
};
