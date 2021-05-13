//menu component
var compMenu = {
    template: `
        <div class="row">
            <div class="col text-left">
                <button type="button" class="btn btn-primary" @click="$emit('change-component'), changeListButton()">{{ listButton }}</button>
            </div>
            <div class="col text-center">
                <h2>TO-DO</h2>
            </div>
            <div class="col text-right">
                <button type="button" class="btn btn-primary" @click="$emit('click', !displayInput), changeAddButton()">{{ addButton }}</button>
            </div>
        </div>
    `,
    props: {
        displayInput: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    model: {
        prop: "displayInput",
        event: "click"
    },
    data: function() {
        return {
            addButton: "新增事项",
            listButton: "显示已完成"
        };
    },
    methods: {
        changeAddButton() {
            this.addButton = this.addButton === "新增事项" ? "隐藏菜单" : "新增事项";
        },
        changeListButton() {
            this.listButton = this.listButton === "显示已完成" ? "显示未完成" : "显示已完成";
        }
    }
};

//input component
var compInput = {
    template: `
        <div class="d-flex input-component">
            <div class="p-2 flex-grow-1 align-self-center">
                <input type="text" :class="['form-control input-box', cautionStyle]" :placeholder="caution" v-model="inputValue" @focus="reset">
            </div>
            <div class="p-2 align-self-center">
                <button type="button" class="btn btn-outline-primary" @click="$emit('click')">确定</button>
            </div>
        </div>
    `,
    data: function() {
        return {
            inputValue: "",
            caution: "输入事项。",
            cautionStyle: ""
        };
    },
    methods: {
        reset() {
            this.caution = "输入事项。";
            this.cautionStyle = "";
        }
    }
};

// remaining list component
var compRemaining = {
    template: `
        <ul>
            <li class="d-flex" v-for="item in reverseRemainingItems">
                <div class="p-2 flex-grow-1 align-self-center" contenteditable="true"  @blur="$emit('edit', item.content, $event.target.innerText)">
                    {{ item.content }}
                </div>
                <div class="p-2 align-self-center">
                    <button type="button" class="btn btn-outline-danger btn-sm" @click="$emit('delete', item.content)">删除</button>
                </div>
                <div class="p-2 align-self-center">
                    <button type="button" class="btn btn-outline-success btn-sm" @click="$emit('completed', item.content)">完成</button>
                </div>
            </li>
        </ul>
    `,
    props: ["reverseRemainingItems", "edit"]
};

// done list component
var compDone = {
    template: `
        <ul>
            <li class="d-flex" v-for="item in reverseDoneItems">
                <div class="p-2 flex-grow-1 align-self-center">
                    {{ item.content }}
                </div>
                <div class="p-2 align-self-center">
                    <button type="button" class="btn btn-outline-danger btn-sm" @click="$emit('delete', item.content)">删除</button>
                </div>
                <div class="p-2 align-self-center">
                    <button type="button" class="btn btn-outline-success btn-sm" @click="$emit('resume', item.content)">恢复</button>
                </div>
            </li>
        </ul>
    `,
    props: ["reverseDoneItems"]
};

//root
new Vue({
    el: "#app",
    data: {
        items: {
            "1620820700331": {
                "content": "剪头发",
                "completed": false,
                "deleted": false
            },
            "1620820766955": {
                "content": "洗衣服 & 搞卫生",
                "completed": false,
                "deleted": false
            },
            "1620820766965": {
                "content": "买个表",
                "completed": false,
                "deleted": false
            },
            "1620820766975": {
                "content": "打电话给老妈",
                "completed": false,
                "deleted": false
            },
            "1620820766985": {
                "content": "晚上加班把剩余工作做完",
                "completed": false,
                "deleted": false
            },
            "1620820767985": {
                "content": "下班后打电话给老爸",
                "completed": true,
                "deleted": false
            },
            "1620820768985": {
                "content": "把项目进度表发给领导",
                "completed": true,
                "deleted": false
            },
            "1620820769985": {
                "content": "把项目资料整理出来",
                "completed": true,
                "deleted": false
            },
            "1620820770985": {
                "content": "背英语单词",
                "completed": true,
                "deleted": false
            },
            "1620820771985": {
                "content": "测试 & 完善功能",
                "completed": true,
                "deleted": false
            }
        },
        displayInput: false,
        component: "comp-remaining"
    },
    components: {
       "comp-menu": compMenu,
       "comp-input": compInput,
       "comp-remaining": compRemaining,
       "comp-done": compDone
    },
    methods: {
        add() {
            if(this.$refs.compInput.inputValue.trim() !== "") {
                var tagName = new Date().getTime().toString();
                var obj = {
                    content: this.$refs.compInput.inputValue.trim(),
                    completed: false,
                    deleted: false
                };
                Vue.set(this.items, tagName, obj);
                
                this.$refs.compInput.inputValue = "";
                this.caution = "输入事项。";
                this.cautionStyle = "";
            } else {
                this.$refs.compInput.inputValue = "";
                this.$refs.compInput.caution = "你还没有输入任何内容。";
                this.$refs.compInput.cautionStyle = "input-caution"
            }
        },
        deleted(value) {
            for(let item in this.items) {
                if(this.items[item].content === value) {
                    this.items[item].deleted = true;
                }
            }
        },
        completed(value) {
            for(let item in this.items) {
                if(this.items[item].content === value) {
                    this.items[item].completed = true;
                }
            }
        },
        resume(value) {
            for(let item in this.items) {
                if(this.items[item].content === value) {
                    this.items[item].completed = false;
                }
            }
        },
        changeComponent() {
            this.component = this.component === "comp-remaining" ? "comp-done" : "comp-remaining";
        },
        edit(event) {
            for(let item in this.items) {
                if(this.items[item].content === event[0]) {
                    this.items[item].content = event[1];
                }
            }
        }
    },
    computed: {
        reverseRemainingItems() {
            var arr = [];
            for(let item in this.items) {
                if(!this.items[item].completed && !this.items[item].deleted) {
                    arr.push(this.items[item]);
                }
            }
            return arr.reverse();
        },
        reverseDoneItems() {
            var arr = [];
            for(let item in this.items) {
                if(this.items[item].completed && !this.items[item].deleted) {
                    arr.push(this.items[item]);
                }
            }
            return arr.reverse();
        }
    }
});