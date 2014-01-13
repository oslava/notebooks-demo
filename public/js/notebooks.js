ko.bindingHandlers['modalForm'] = {
    'update': function (element, valueAccessor) {
        var event = ko.utils.unwrapObservable(valueAccessor());
        switch (event) {
            case 'show':
            case 'hide':
                $(element).modal(event);
                break;
            case 'post':
                $(":submit", $(element)).button("loading");
                break;
            case 'stop':
                $(":submit", $(element)).button("reset");
                break;
        }
    }
};

var NotebookViewModel = function(data) {
    this._id = data._id;
    this.name = data.name;
    this.visibility = data.visibility;
    this.notes = ko.observableArray(data.notes);
    ko.utils.arrayForEach(this.notes(), function(item) {
        var d = new Date();
        d.setTime(Date.parse(item.modified));
        item.modified = d;
    });

    this.nullNote = { _id: null, title: '', text: '', modified: Date.now };
    this.activeNote = ko.observable($.extend({}, this.nullNote));

    this.modalEvent = ko.observable({ modal: '' });
    this.fireModal = function(value) {
        var state = { modal: value };
        this.modalEvent(state);
        // Just an event without state.
        state.modal = '';
    };

    var self = this;
    self.activate = function(note) {
        // Always copy! Modify only a copy of note.
        self.activeNote($.extend({}, note));
        self.saveError('');
    };

    self.createNote = function() {
        self.activate(self.nullNote);
        self.fireModal('show');
    };

    self.editNote = function() {
        self.activate(this);
        self.fireModal('show');
    };

    this.saveError = ko.observable('');
    self.saveActiveNote = function(){
        var note = self.activeNote();
        var settings = {
            url: "/api/v1/books/" + self._id + "/notes",
            method: "POST",
            data: note,
            complete: function() {
                self.fireModal('stop');
            },
            success: function(data){
                self.fireModal('hide');
                self.add(data);
            },
            error: function(jqXHR) {
                if (jqXHR.responseText) {
                    var error = JSON.parse(jqXHR.responseText);
                    self.saveError(error.message || 'Unexpected error.');
                } else {
                    self.saveError('Unexpected error.');
                }
            }
        };

        if (note._id) {
            settings.url = settings.url + "/" + note._id;
            settings.method = "PUT";
        }

        self.fireModal('post');
        $.ajax(settings);
    };

    self.add = function(data){
        var item = ko.utils.arrayFirst(self.notes(), function(item) {
            return item._id == data._id
        });

        if (item)
            ko.utils.arrayRemoveItem(self.notes(), item);

        var d = new Date();
        d.setTime(Date.parse(data.modified));
        data.modified = d;
        self.notes.splice(0, 0, data);
    };

    self.removeNote = function() {
        if (this._id) {

            $.ajax({
                url: "/api/v1/books/" + self._id + "/notes/" + this._id,
                method: "DELETE"
            });

            self.notes.remove(this);
        }
    };
};

var NotebooksViewModel = function(items) {
    this.notebooks = ko.observableArray(ko.utils.arrayMap(items, function(data) {
        return new NotebookViewModel(data);
    }));

    this.nullItem = { _id: null, name: '', visibility: 'private', notes: [] };
    this.activeNotebook = ko.observable(new NotebookViewModel(this.nullItem));

    var self = this;
    self.activate = function() {
        self.activeNotebook(this);
    };

    self.add = function(data) {
        var item = new NotebookViewModel(data);
        self.notebooks.splice(0, 0, item);
        self.activeNotebook(item);
    };

    self.removeActiveNotebook = function() {
        var data = self.activeNotebook();
        if (data._id) {

            $.ajax({
                url: "/api/v1/books/" + data._id,
                method: "DELETE"
            });

            self.activate.bind(new NotebookViewModel(self.nullItem))();
            self.notebooks.remove(data);
        }
    };
};

var notebooksVM = null;

$(document).ready(function() {
    $.ajax({
        url: "/api/v1/books",
        method: "GET",
        success: function(data) {
            notebooksVM = new NotebooksViewModel(data);
            ko.applyBindings(notebooksVM);
        }
    });
});

// Dirty. Non MVVM method.
$(document.forms['newNotebookForm']).on('submit', function() {
    var form = $(this);
    $('.alert', form).hide();
    $(":submit", form).button("loading");

    $.ajax({
        url: "/api/v1/books",
        method: "POST",
        data: form.serialize(),
        complete: function() {
            $(":submit", form).button("reset");
        },
        success: function(data) {
            $('.form-control', form).val('');
            $('#notebookDialog').modal('hide');
            notebooksVM.add(data);
        },
        error: function(jqXHR) {
            var error = JSON.parse(jqXHR.responseText);
            $('.alert', form).html(error.message).show();
        }
    });
    return false;
});
