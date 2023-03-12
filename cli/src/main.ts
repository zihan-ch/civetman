// Source: /Users/zionchen/Main/h/civetman/examples/base/node_modules/civetman/src/main.civet
// Generated by Civetman

import c from "picocolors";
import { program } from "commander"
import fs from "fs-extra"
import glob from "fast-glob";
import { join } from "node:path"
import chokidar from "chokidar"
import ora from "ora";
import { compile } from "@danielx/civet"

const cwd = process.cwd()
const vscodeConfigDir = join(cwd, ".vscode")
const vscodeConfigFile = join(vscodeConfigDir, "settings.json")

const collectFiles = async () => { 
    return await glob("**/*.civet", {ignore: ["node_modules/**/*", "dist/**/*"], cwd: cwd})
}

const step = async (desc: string, fn: any) => { 
    const spinner = ora(desc)
    spinner.start()
    await Promise.resolve(fn())
    return spinner.stop()
}

const compileFile = async (file: string) => {
    const a = 5 + 7
    const content = await fs.readFile(file, "utf8")
    const compiled = await compile(content, ({inlineMap: true}) as any)
    return `// Source: ${file}
// Generated by Civetman

${compiled}`
}

const buildFile = async (file: string, tsx: boolean) => {
    const outFile = file.replace(".civet", tsx ? ".tsx" : ".ts")
    const compiled = await compileFile(file)
    await fs.writeFile(outFile, compiled, "utf8")
    return outFile
}

const civetmanVscodeConfigBanner = "below is generated by civetman"
const vscodeConfigFileExludeKey = "files.exclude"
const addVscodeConfigFileExclude = async (files: string[]) => { 
    const spinner = ora(c.blue(`Adding exclude files to VSCode config`))
    spinner.start()

    await fs.ensureDir(vscodeConfigDir)
    await fs.ensureFile(vscodeConfigFile)
    const vscconfig = JSON.parse((await fs.readFile(vscodeConfigFile)).toString())
    if (!vscconfig[vscodeConfigFileExludeKey]) vscconfig[vscodeConfigFileExludeKey] = {}

    let found = false
    vscconfig[vscodeConfigFileExludeKey] = [
        ...Object.keys(vscconfig[vscodeConfigFileExludeKey]).reduce(((prev: string[], curr: string) => { 
            if (curr === civetmanVscodeConfigBanner) found = true
            return found ? prev : [...prev, curr]
        }
           ), []), 
        civetmanVscodeConfigBanner, 
        ...files,
    ].reduce((prev, file) => ({ ...prev, [file]: true }), {})

    await fs.writeFile(vscodeConfigFile, (JSON.stringify(vscconfig, null, "\t")), "utf8")

    spinner.stop()
    return spinner.succeed()
}

const gitignoreFile = join(cwd, ".gitignore")
const gitignoreStart = `# Generated by Civetman
# DO NOT ADD CONTENT BELOW THIS (They will be removed by Civetman)`
const addGitignore = async (files: string[]) => { 
    const spinner = ora(c.blue(`Adding files to .gitignore...`))
    spinner.start()

    await fs.ensureFile(vscodeConfigFile)
    const gitignore = await fs.readFile(gitignoreFile, "utf8")
    const start = gitignore.indexOf(gitignoreStart)
    const before = start === -1 ? gitignore : gitignore.slice(0, start)
    const content = `${before.trimEnd()}

${gitignoreStart}
${files.join("\n")}`
    await fs.writeFile(gitignoreFile, content, "utf8")

    spinner.stop()
    return spinner.succeed()
}
    
program
    .name("civetman") 
    .description("Use Civet in any projects!") 
    .version("0.0.1")
    .option("-x, --tsx, --jsx", "Generate `.tsx` files instead of `.ts` files")

type Options = { tsx: boolean }
let opts = null as unknown as Options
const defaultOpts = { tsx: false }

program
    .command("build")
    .description("Start building Civet files") 
    .action(async () => { 
        console.log(c.blue(`Civetman starts building...\n`))

        const spinner = ora(c.blue(`Building Civet files\n`))
        const files = await collectFiles()
        const outFiles = [] as string[]
        for (const file of files) {
            const outFile = await buildFile(file, opts.tsx)
            outFiles.push(outFile)
            spinner.succeed(`${c.cyan(file)} -> ${c.green(outFile)}`)
        }
        spinner.stop()
        spinner.succeed("All Civet files built!\n")
        
        await addVscodeConfigFileExclude(outFiles)
        await addGitignore(outFiles)

        console.log(c.green(`\nCivetman finished building!`))

        return
})

program
    .command("dev")
    .description("Start building Civet files in watch mode")
    .action(async () => { 
        console.log(c.blue(`Civetman starts building...\n`))
        const spinner = ora(c.blue(`Building Civet files\n`))

        const buildOneFile = async (file: string) => { 
            const outFile = await buildFile(file, opts.tsx)
            outFiles.push(outFile)
            return spinner.succeed(`${c.cyan(file)} -> ${c.green(outFile)}`)
        }

        const files = await collectFiles()
        const outFiles = [] as string[]
        for (const file of files) {
            buildOneFile(file)
        }
        
        await addVscodeConfigFileExclude(outFiles)
        await addGitignore(outFiles)

        const watcher = chokidar.watch(cwd, {ignored: ["node_modules/**/*", "dist/**/*"]})
        watcher.on("add", async (file) => { 
            if (file.endsWith(".civet")) { 
                buildOneFile(file)
                return files.push(file)
            }
            return
        })
        
        // watcher.on("change", async (file) => {
        //     outFile := await buildFile file, opts.tsx
        //     outFiles.push outFile
        //     spinner.succeed """
        //         #{c.cyan file} -> #{c.green outFile}
        //     """
        // })

        return
})

export default () => { 
    program.hook('preAction' , () => { opts = { ...defaultOpts, ...program.opts<Options>() }; })
    return program.parse(process.argv)
}
//# sourceMappingURL=data:application/json;base64,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QUNiLEFBQUE7QUFDQSxBQUFBLFFBQVEsTTtBQUFNLENBQUEsQ0FBQTtBQUNkLEFBQUE7QUFDQSxBQUFBLEFBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQyxFQUFHLENBQUEsQ0FBQSxDQUFDO0FBQ3JCLEFBQUEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFBLEFBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFLEdBQUUsQ0FBQSxDQUFBLENBQUMsSUFBSSxDLENBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJLENBQUssTyxDQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUEsQ0FBQTtBQUN4RixBQUFBLEksT0FBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEM7QUFDOUIiLCJuYW1lcyI6W10sInNvdXJjZXNDb250ZW50IjpbImMgZnJvbSBcInBpY29jb2xvcnNcIlxueyBwcm9ncmFtIH0gZnJvbSBcImNvbW1hbmRlclwiXG5mcyBmcm9tIFwiZnMtZXh0cmFcIlxuZ2xvYiBmcm9tIFwiZmFzdC1nbG9iXCJcbnsgam9pbiB9IGZyb20gXCJub2RlOnBhdGhcIlxuY2hva2lkYXIgZnJvbSBcImNob2tpZGFyXCJcbm9yYSBmcm9tIFwib3JhXCJcbnsgY29tcGlsZSB9IGZyb20gXCJAZGFuaWVseC9jaXZldFwiXG5cbmN3ZCA6PSBwcm9jZXNzLmN3ZCgpXG52c2NvZGVDb25maWdEaXIgOj0gam9pbiBjd2QsIFwiLnZzY29kZVwiXG52c2NvZGVDb25maWdGaWxlIDo9IGpvaW4gdnNjb2RlQ29uZmlnRGlyLCBcInNldHRpbmdzLmpzb25cIlxuXG5jb2xsZWN0RmlsZXMgOj0gYXN5bmMgPT4gXG4gICAgYXdhaXQgZ2xvYiBcIioqLyouY2l2ZXRcIiwgaWdub3JlOiBbXCJub2RlX21vZHVsZXMvKiovKlwiLCBcImRpc3QvKiovKlwiXSwgY3dkOiBjd2Rcblxuc3RlcCA6PSBhc3luYyAoZGVzYzogc3RyaW5nLCBmbjogYW55KSA9PiBcbiAgICBjb25zdCBzcGlubmVyID0gb3JhIGRlc2NcbiAgICBzcGlubmVyLnN0YXJ0KClcbiAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUgZm4oKVxuICAgIHNwaW5uZXIuc3RvcCgpXG5cbmNvbXBpbGVGaWxlIDo9IGFzeW5jIChmaWxlOiBzdHJpbmcpID0+XG4gICAgYSA6PSA1IHw+ICYgKyA3XG4gICAgY29udGVudCA6PSBhd2FpdCBmcy5yZWFkRmlsZSBmaWxlLCBcInV0ZjhcIlxuICAgIGNvbXBpbGVkIDo9IGF3YWl0IGNvbXBpbGUgY29udGVudCwgKGlubGluZU1hcDogdHJ1ZSkgYXMgYW55XG4gICAgXCJcIlwiXG4gICAgLy8gU291cmNlOiAje2ZpbGV9XG4gICAgLy8gR2VuZXJhdGVkIGJ5IENpdmV0bWFuXG5cbiAgICAje2NvbXBpbGVkfVxuICAgIFwiXCJcIlxuXG5idWlsZEZpbGUgOj0gYXN5bmMgKGZpbGU6IHN0cmluZywgdHN4OiBib29sZWFuKSA9PlxuICAgIG91dEZpbGUgOj0gZmlsZS5yZXBsYWNlIFwiLmNpdmV0XCIsIHRzeCA/IFwiLnRzeFwiIDogXCIudHNcIlxuICAgIGNvbXBpbGVkIDo9IGF3YWl0IGNvbXBpbGVGaWxlIGZpbGVcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUgb3V0RmlsZSwgY29tcGlsZWQsIFwidXRmOFwiXG4gICAgb3V0RmlsZVxuXG5jaXZldG1hblZzY29kZUNvbmZpZ0Jhbm5lciA6PSBcImJlbG93IGlzIGdlbmVyYXRlZCBieSBjaXZldG1hblwiXG52c2NvZGVDb25maWdGaWxlRXhsdWRlS2V5IDo9IFwiZmlsZXMuZXhjbHVkZVwiXG5hZGRWc2NvZGVDb25maWdGaWxlRXhjbHVkZSA6PSBhc3luYyAoZmlsZXM6IHN0cmluZ1tdKSA9PiBcbiAgICBzcGlubmVyIDo9IG9yYSBjLmJsdWUgXCJcIlwiQWRkaW5nIGV4Y2x1ZGUgZmlsZXMgdG8gVlNDb2RlIGNvbmZpZ1wiXCJcIlxuICAgIHNwaW5uZXIuc3RhcnQoKVxuXG4gICAgYXdhaXQgZnMuZW5zdXJlRGlyIHZzY29kZUNvbmZpZ0RpclxuICAgIGF3YWl0IGZzLmVuc3VyZUZpbGUgdnNjb2RlQ29uZmlnRmlsZVxuICAgIHZzY2NvbmZpZyA6PSBKU09OLnBhcnNlIChhd2FpdCBmcy5yZWFkRmlsZSB2c2NvZGVDb25maWdGaWxlKS50b1N0cmluZygpXG4gICAgaWYgIXZzY2NvbmZpZ1t2c2NvZGVDb25maWdGaWxlRXhsdWRlS2V5XSB0aGVuIHZzY2NvbmZpZ1t2c2NvZGVDb25maWdGaWxlRXhsdWRlS2V5XSA9IHt9XG5cbiAgICBmb3VuZCAuPSBmYWxzZVxuICAgIHZzY2NvbmZpZ1t2c2NvZGVDb25maWdGaWxlRXhsdWRlS2V5XSA9IFtcbiAgICAgICAgLi4uT2JqZWN0LmtleXModnNjY29uZmlnW3ZzY29kZUNvbmZpZ0ZpbGVFeGx1ZGVLZXldKS5yZWR1Y2UoKChwcmV2OiBzdHJpbmdbXSwgY3Vycjogc3RyaW5nKSA9PiBcbiAgICAgICAgICAgIGlmIGN1cnIgPT09IGNpdmV0bWFuVnNjb2RlQ29uZmlnQmFubmVyIHRoZW4gZm91bmQgPSB0cnVlXG4gICAgICAgICAgICBmb3VuZCA/IHByZXYgOiBbLi4ucHJldiwgY3Vycl1cbiAgICAgICAgICAgKSwgW10pLCBcbiAgICAgICAgY2l2ZXRtYW5Wc2NvZGVDb25maWdCYW5uZXIsIFxuICAgICAgICAuLi5maWxlcyxcbiAgICBdLnJlZHVjZSAocHJldiwgZmlsZSkgPT4gKHsgLi4ucHJldiwgW2ZpbGVdOiB0cnVlIH0pLCB7fVxuXG4gICAgYXdhaXQgZnMud3JpdGVGaWxlIHZzY29kZUNvbmZpZ0ZpbGUsIChKU09OLnN0cmluZ2lmeSB2c2Njb25maWcsIG51bGwsIFwiXFx0XCIpLCBcInV0ZjhcIlxuXG4gICAgc3Bpbm5lci5zdG9wKClcbiAgICBzcGlubmVyLnN1Y2NlZWQoKVxuXG5naXRpZ25vcmVGaWxlIDo9IGpvaW4gY3dkLCBcIi5naXRpZ25vcmVcIlxuZ2l0aWdub3JlU3RhcnQgOj0gXCJcIlwiXG4gICAgIyBHZW5lcmF0ZWQgYnkgQ2l2ZXRtYW5cbiAgICAjIERPIE5PVCBBREQgQ09OVEVOVCBCRUxPVyBUSElTIChUaGV5IHdpbGwgYmUgcmVtb3ZlZCBieSBDaXZldG1hbilcblwiXCJcIlxuYWRkR2l0aWdub3JlIDo9IGFzeW5jIChmaWxlczogc3RyaW5nW10pID0+IFxuICAgIHNwaW5uZXIgOj0gb3JhIGMuYmx1ZSBcIlwiXCJBZGRpbmcgZmlsZXMgdG8gLmdpdGlnbm9yZS4uLlwiXCJcIlxuICAgIHNwaW5uZXIuc3RhcnQoKVxuXG4gICAgYXdhaXQgZnMuZW5zdXJlRmlsZSB2c2NvZGVDb25maWdGaWxlXG4gICAgZ2l0aWdub3JlIDo9IGF3YWl0IGZzLnJlYWRGaWxlIGdpdGlnbm9yZUZpbGUsIFwidXRmOFwiXG4gICAgc3RhcnQgOj0gZ2l0aWdub3JlLmluZGV4T2YgZ2l0aWdub3JlU3RhcnRcbiAgICBiZWZvcmUgOj0gc3RhcnQgPT09IC0xID8gZ2l0aWdub3JlIDogZ2l0aWdub3JlLnNsaWNlIDAsIHN0YXJ0XG4gICAgY29udGVudCA6PSBcIlwiXCJcbiAgICAgICAgI3tiZWZvcmUudHJpbUVuZCgpfVxuXG4gICAgICAgICN7Z2l0aWdub3JlU3RhcnR9XG4gICAgICAgICN7ZmlsZXMuam9pbihcIlxcblwiKX1cbiAgICBcIlwiXCJcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUgZ2l0aWdub3JlRmlsZSwgY29udGVudCwgXCJ1dGY4XCJcblxuICAgIHNwaW5uZXIuc3RvcCgpXG4gICAgc3Bpbm5lci5zdWNjZWVkKClcbiAgICBcbnByb2dyYW1cbiAgICAubmFtZSBcImNpdmV0bWFuXCIgXG4gICAgLmRlc2NyaXB0aW9uIFwiVXNlIENpdmV0IGluIGFueSBwcm9qZWN0cyFcIiBcbiAgICAudmVyc2lvbiBcIjAuMC4xXCJcbiAgICAub3B0aW9uIFwiLXgsIC0tdHN4LCAtLWpzeFwiLCBcIkdlbmVyYXRlIGAudHN4YCBmaWxlcyBpbnN0ZWFkIG9mIGAudHNgIGZpbGVzXCJcblxudHlwZSBPcHRpb25zID0geyB0c3g6IGJvb2xlYW4gfVxub3B0cyAuPSBudWxsIGFzIHVua25vd24gYXMgT3B0aW9uc1xuZGVmYXVsdE9wdHMgOj0geyB0c3g6IGZhbHNlIH1cblxucHJvZ3JhbVxuICAgIC5jb21tYW5kIFwiYnVpbGRcIlxuICAgIC5kZXNjcmlwdGlvbiBcIlN0YXJ0IGJ1aWxkaW5nIENpdmV0IGZpbGVzXCIgXG4gICAgLmFjdGlvbiBhc3luYyA9PiBcbiAgICAgICAgY29uc29sZS5sb2cgYy5ibHVlIFwiXCJcIkNpdmV0bWFuIHN0YXJ0cyBidWlsZGluZy4uLlxcblwiXCJcIlxuXG4gICAgICAgIHNwaW5uZXIgOj0gb3JhIGMuYmx1ZSBcIlwiXCJCdWlsZGluZyBDaXZldCBmaWxlc1xcblwiXCJcIlxuICAgICAgICBmaWxlcyA6PSBhd2FpdCBjb2xsZWN0RmlsZXMoKVxuICAgICAgICBvdXRGaWxlcyA6PSBbXSBhcyBzdHJpbmdbXVxuICAgICAgICBmb3IgZmlsZSBvZiBmaWxlc1xuICAgICAgICAgICAgb3V0RmlsZSA6PSBhd2FpdCBidWlsZEZpbGUgZmlsZSwgb3B0cy50c3hcbiAgICAgICAgICAgIG91dEZpbGVzLnB1c2ggb3V0RmlsZVxuICAgICAgICAgICAgc3Bpbm5lci5zdWNjZWVkIFwiXCJcIlxuICAgICAgICAgICAgICAgICN7Yy5jeWFuIGZpbGV9IC0+ICN7Yy5ncmVlbiBvdXRGaWxlfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNwaW5uZXIuc3RvcCgpXG4gICAgICAgIHNwaW5uZXIuc3VjY2VlZChcIkFsbCBDaXZldCBmaWxlcyBidWlsdCFcXG5cIilcbiAgICAgICAgXG4gICAgICAgIGF3YWl0IGFkZFZzY29kZUNvbmZpZ0ZpbGVFeGNsdWRlIG91dEZpbGVzXG4gICAgICAgIGF3YWl0IGFkZEdpdGlnbm9yZSBvdXRGaWxlc1xuXG4gICAgICAgIGNvbnNvbGUubG9nIGMuZ3JlZW4gXCJcIlwiXFxuQ2l2ZXRtYW4gZmluaXNoZWQgYnVpbGRpbmchXCJcIlwiXG5cbiAgICAgICAgcmV0dXJuXG5cbnByb2dyYW1cbiAgICAuY29tbWFuZCBcImRldlwiXG4gICAgLmRlc2NyaXB0aW9uIFwiU3RhcnQgYnVpbGRpbmcgQ2l2ZXQgZmlsZXMgaW4gd2F0Y2ggbW9kZVwiXG4gICAgLmFjdGlvbiBhc3luYyA9PiBcbiAgICAgICAgY29uc29sZS5sb2cgYy5ibHVlIFwiXCJcIkNpdmV0bWFuIHN0YXJ0cyBidWlsZGluZy4uLlxcblwiXCJcIlxuICAgICAgICBzcGlubmVyIDo9IG9yYSBjLmJsdWUgXCJcIlwiQnVpbGRpbmcgQ2l2ZXQgZmlsZXNcXG5cIlwiXCJcblxuICAgICAgICBidWlsZE9uZUZpbGUgOj0gYXN5bmMgKGZpbGU6IHN0cmluZykgPT4gXG4gICAgICAgICAgICBvdXRGaWxlIDo9IGF3YWl0IGJ1aWxkRmlsZSBmaWxlLCBvcHRzLnRzeFxuICAgICAgICAgICAgb3V0RmlsZXMucHVzaCBvdXRGaWxlXG4gICAgICAgICAgICBzcGlubmVyLnN1Y2NlZWQgXCJcIlwiXG4gICAgICAgICAgICAgICAgI3tjLmN5YW4gZmlsZX0gLT4gI3tjLmdyZWVuIG91dEZpbGV9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBmaWxlcyA6PSBhd2FpdCBjb2xsZWN0RmlsZXMoKVxuICAgICAgICBvdXRGaWxlcyA6PSBbXSBhcyBzdHJpbmdbXVxuICAgICAgICBmb3IgZmlsZSBvZiBmaWxlc1xuICAgICAgICAgICAgYnVpbGRPbmVGaWxlIGZpbGVcbiAgICAgICAgXG4gICAgICAgIGF3YWl0IGFkZFZzY29kZUNvbmZpZ0ZpbGVFeGNsdWRlIG91dEZpbGVzXG4gICAgICAgIGF3YWl0IGFkZEdpdGlnbm9yZSBvdXRGaWxlc1xuXG4gICAgICAgIHdhdGNoZXIgOj0gY2hva2lkYXIud2F0Y2ggY3dkLCBpZ25vcmVkOiBbXCJub2RlX21vZHVsZXMvKiovKlwiLCBcImRpc3QvKiovKlwiXVxuICAgICAgICB3YXRjaGVyLm9uIFwiYWRkXCIsIGFzeW5jIChmaWxlKSA9PiBcbiAgICAgICAgICAgIGlmIGZpbGUuZW5kc1dpdGgoXCIuY2l2ZXRcIikgXG4gICAgICAgICAgICAgICAgYnVpbGRPbmVGaWxlIGZpbGVcbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoIGZpbGVcbiAgICAgICAgXG4gICAgICAgIC8vIHdhdGNoZXIub24oXCJjaGFuZ2VcIiwgYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgLy8gICAgIG91dEZpbGUgOj0gYXdhaXQgYnVpbGRGaWxlIGZpbGUsIG9wdHMudHN4XG4gICAgICAgIC8vICAgICBvdXRGaWxlcy5wdXNoIG91dEZpbGVcbiAgICAgICAgLy8gICAgIHNwaW5uZXIuc3VjY2VlZCBcIlwiXCJcbiAgICAgICAgLy8gICAgICAgICAje2MuY3lhbiBmaWxlfSAtPiAje2MuZ3JlZW4gb3V0RmlsZX1cbiAgICAgICAgLy8gICAgIFwiXCJcIlxuICAgICAgICAvLyB9KVxuXG4gICAgICAgIHJldHVyblxuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiBcbiAgICBwcm9ncmFtLmhvb2sgJ3ByZUFjdGlvbicgLCA9PiBvcHRzID0geyAuLi5kZWZhdWx0T3B0cywgLi4ucHJvZ3JhbS5vcHRzPE9wdGlvbnM+KCkgfTtcbiAgICBwcm9ncmFtLnBhcnNlKHByb2Nlc3MuYXJndikiXX0=
